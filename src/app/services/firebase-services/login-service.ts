import { Injectable } from '@angular/core';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../../models/user';
import { UserServiceService } from './user-service.service';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private auth = getAuth();
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  userFound: boolean | undefined = false;

  constructor(private firestore: Firestore, private userService: UserServiceService, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    this.currentUser = this.currentUserSubject.asObservable();

    onAuthStateChanged(this.auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await this.userService.getSingleUser('users', firebaseUser.uid);
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data() as User;
          this.currentUserSubject.next(userData);
        }
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  async getCurrentUserAsync(): Promise<User | null> {
    return new Promise((resolve) => {
      onAuthStateChanged(this.auth, async (firebaseUser) => {
        if (firebaseUser) {
          const userDoc = await this.userService.getSingleUser('users', firebaseUser.uid);
          const userSnapshot = await getDoc(userDoc);
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data() as User;
            resolve(userData);
          } else {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    });
  }


  async login(email: string, password: string): Promise<void> {
    try {
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      const firebaseUser = result.user;
      const userDoc = await this.userService.getSingleUser('users', firebaseUser.uid);
      const userSnapshot = await getDoc(userDoc);

      if (userSnapshot.exists()) {
        this.userFound = true;
        await updateDoc(userDoc, { onlineStatusbar: 'online' });
        const userData = userSnapshot.data() as User;
        userData.onlineStatusbar = 'online';
        this.currentUserSubject.next(userData);
       
        setTimeout(() => {
          this.userFound = false;
          this.router.navigate(['/chat']);
        }, 2000);
      }
    } catch (error) {
      
    }
  }

  async logout(): Promise<void> {
    try {
      const currentUser = this.currentUserSubject.value;
      if (currentUser) {
        const userDoc = await this.userService.getSingleUser('users', currentUser.id!);
        await updateDoc(userDoc, { onlineStatusbar: 'offline' });
      }
      await signOut(this.auth);
      this.currentUserSubject.next(null);      
    } catch (error) {
    }
  }

  editUserName(userId: string, name: string) {
    const userRef = doc(this.firestore, 'users', userId);
    updateDoc(userRef, {
      name: name
    });
  }

  async guestLogin(): Promise<void> {
    const guestEmail = 'guest@guest.de';
    const guestPassword = 'Guest!';
    try {
      const result = await signInWithEmailAndPassword(this.auth, guestEmail, guestPassword);
      const firebaseUser = result.user;
      const userDoc = await this.userService.getSingleUser('users', firebaseUser.uid);
      const userSnapshot = await getDoc(userDoc);
      this.userFound = true;

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data() as User;
        this.userFound = true;
        this.currentUserSubject.next(userData);
        await updateDoc(userDoc, { onlineStatusbar: 'online' });        
        setTimeout(() => {
          this.userFound = false;
          this.router.navigate(['/chat']);
        }, 2000);
      }
    } catch (error) {      
      throw error;
    }
  }
}