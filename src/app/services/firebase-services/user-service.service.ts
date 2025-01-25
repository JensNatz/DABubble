import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, query, orderBy, addDoc, serverTimestamp, doc } from '@angular/fire/firestore';
import { User } from '../../models/user';
import { firstValueFrom, Observable } from 'rxjs';
import { getAuth, sendPasswordResetEmail } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class UserServiceService {
  firestore: Firestore = inject(Firestore);
  auth = getAuth();

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

  async addNewUser(item: User) {
    try {
      const docRef = await addDoc(this.getUserRef(), item);
      console.log('Document ID:', docRef.id);
    } catch (err) {
      console.error('Error adding document:', err);
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
      console.log('email gesendet');
    } catch (err) {
      console.error('Error sending password reset email:', err);
    }
  }
}