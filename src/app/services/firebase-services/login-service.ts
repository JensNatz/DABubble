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
          console.log('Current user:', userData);
        }
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  async login(email: string, password: string): Promise<void> {
    try {
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      const firebaseUser = result.user;
      const userDoc = await this.userService.getSingleUser('users', firebaseUser.uid);
      const userSnapshot = await getDoc(userDoc);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data() as User;
        this.userFound = true;
        this.currentUserSubject.next(userData);
        console.log('User logged in:', userData);
        setTimeout(() => {
          this.userFound = false;
          this.router.navigate(['/chat'])
        }, 2000);
       
        
      }
    } catch (error) {
      
    }
  }

  async logout(): Promise<void> {
    try {
      const currentUser = this.currentUserSubject.value;
      await signOut(this.auth);
      this.currentUserSubject.next(null);
      console.log(`User ${currentUser?.email} hat sich ausgelogt`);
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  }

  editUserName(userId: string, name: string) {
      const userRef = doc(this.firestore, 'users', userId);
      updateDoc(userRef, {
        name: name
      });
    }
}