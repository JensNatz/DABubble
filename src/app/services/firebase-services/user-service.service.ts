import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, query, orderBy, addDoc, serverTimestamp, doc, setDoc, updateDoc, docData, } from '@angular/fire/firestore';
import { User } from '../../models/user';
import { firstValueFrom, Observable } from 'rxjs';
import { confirmPasswordReset, createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, verifyPasswordResetCode } from '@angular/fire/auth';



@Injectable({
  providedIn: 'root'
})
export class UserServiceService {
  firestore: Firestore = inject(Firestore);
  auth = getAuth();
  id = "";

  constructor() { }

  getUserRef() {
    return collection(this.firestore, 'users');
  }

  getSingleUser(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }

  getUsers(): Observable<User[]> {
    const userRef = this.getUserRef();
    const q = query(userRef, orderBy('name'));
    return collectionData(q, { idField: 'id' }) as Observable<User[]>;
  }

  // Diese Methode gibt ein Observable für den einzelnen Benutzer zurück
  getUserById(userId: string): Observable<User> {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    return docData(userDocRef) as Observable<User>;
  }

  async addNewUser(item: User) {
    try {
      const docRef = await addDoc(this.getUserRef(), item);
      this.id = docRef.id;
      await updateDoc(docRef, { id: this.id });
    } catch (err) {
      console.error('Error adding document:', err);
    }
  }

  async registerUser(email: string, password: string, userData: Partial<User>): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const firebaseUser = userCredential.user;

      const newUser: User = {
        id: firebaseUser.uid,
        email: email,
        name: userData.name || '',
        avatar: userData.avatar || '',
        password: password,
        onlineStatusbar: userData.onlineStatusbar || 'offline'
      };

      await setDoc(doc(this.firestore, 'users', firebaseUser.uid), newUser);
      console.log('User registered and added to Firestore:', firebaseUser.uid);
    } catch (error) {
      console.error('Error during user registration:', error);
      throw error;
    }
  }

  async userExists(email: string, password: string): Promise<boolean> {
    try {
      const users = await firstValueFrom(this.getUsers());
      return users ? users.some(user => user.email === email && user.password === password) : false;
    } catch (err) {
      console.error('Error checking if user exists:', err);
      return false;
    }
  }

  async emailExists(email: string): Promise<boolean> {
    try {
      const users = await firstValueFrom(this.getUsers());
      return users ? users.some(user => user.email === email) : false;
    } catch (err) {
      console.error('Error checking if email exists:', err);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
      console.log(email);
    } catch (err) {
      console.error('Error sending password reset email:', err);
    }
  }

  async verifyPasswordResetCode(code: string): Promise<string> {
    try {
      const email = await verifyPasswordResetCode(this.auth, code);
      console.log(` ${email}`);
      return email;
    } catch (err) {
      console.error('Error verifying password reset code:', err);
      throw err;
    }
  }

  async confirmPasswordReset(code: string, newPassword: string): Promise<void> {
    try {
      await confirmPasswordReset(this.auth, code, newPassword);
    } catch (err) {
      console.error('Error confirming password reset:', err);
      throw err;
    }
  }
}
