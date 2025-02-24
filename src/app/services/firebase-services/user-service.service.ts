import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, query, orderBy, addDoc, doc, setDoc, updateDoc, docData, getDoc, where } from '@angular/fire/firestore';
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

  getUserById(userId: string): Observable<User> {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    return docData(userDocRef) as Observable<User>;
  }

  async getUserByIdOnce(userId: string): Promise<User | null> {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    const snapshot = await getDoc(userDocRef);
    return snapshot.exists() ? (snapshot.data() as User) : null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const userRef = this.getUserRef();
    const q = query(userRef, where('email', '==', email));
    const querySnapshot = await firstValueFrom(collectionData(q, { idField: 'id' }) as Observable<User[]>);
    return querySnapshot.length > 0 ? querySnapshot[0] : null;
  }


  async addNewUser(item: User) {
    try {
      const docRef = await addDoc(this.getUserRef(), item);
      this.id = docRef.id;
      await updateDoc(docRef, { id: this.id });
    } catch (err) {
     
    }
  }

  async registerUser(email: string, password: string, userData: Partial<User>): Promise<string> {
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
     
      return firebaseUser.uid;
    } catch (error) {
      
      throw error;
    }
  }

  async userExists(email: string, password: string): Promise<boolean> {
    try {
      const users = await firstValueFrom(this.getUsers());
      return users ? users.some(user => user.email === email && user.password === password) : false;
    } catch (err) {
     
      return false;
    }
  }

  async emailExists(email: string): Promise<boolean> {
    try {
      const users = await firstValueFrom(this.getUsers());
      return users ? users.some(user => user.email === email) : false;
    } catch (err) {
      
      return false;
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
      
    } catch (err) {      
    }
  }

  async verifyPasswordResetCode(code: string): Promise<string> {
    try {
      const email = await verifyPasswordResetCode(this.auth, code);
      
      return email;
    } catch (err) {
      throw err;
    }
  }

  async confirmPasswordReset(code: string, newPassword: string): Promise<void> {
    try {
      await confirmPasswordReset(this.auth, code, newPassword);    
    } catch (err) { 
      throw err;
    }
  }

  async updateUser(userId: string, updatedData: Partial<User>): Promise<void> {
    try {
      const userDocRef = doc(this.firestore, `users/${userId}`);
      await updateDoc(userDocRef, updatedData);
      //console.log('User updated successfully');
    } catch (err) {
      //console.error('Error updating user:', err);
      throw err;
    }
  }

  async updateUserPasswordInDatabase(userId: string, newPassword: string): Promise<void> {
    try {
      const userDocRef = doc(this.firestore, `users/${userId}`);
      await updateDoc(userDocRef, { password: newPassword });
      //console.log('Password updated successfully in database');
    } catch (err) {
      //console.error('Error updating password in database:', err);
      throw err;
    }
  }
}