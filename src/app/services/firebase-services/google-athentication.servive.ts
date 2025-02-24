import { Injectable } from '@angular/core';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, Firestore, getDoc, setDoc } from '@angular/fire/firestore';
import { UserServiceService } from './user-service.service';
import { User } from '../../models/user';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthenticationService {
  private auth = getAuth();
  private provider = new GoogleAuthProvider();
  private defaultAvatarPath = '../../../assets/img/avatar1.svg';
  userFound:boolean = false;
  

  constructor(private firestore: Firestore, private userService: UserServiceService,private router: Router) { }

  async signInWithGoogle(): Promise<void> {
    try {
      const result = await signInWithPopup(this.auth, this.provider);

      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      const user = result.user;     
      const userDocRef = doc(this.firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {       
        await setDoc(userDocRef, { onlineStatusbar: 'online' }, { merge: true });
        
        
      } else {       
        const newUser: User = {
          id: user.uid,
          email: user.email || '',
          name: user.displayName || '',
          avatar: '3',
          password: '',
          onlineStatusbar: 'online'
        };
        await setDoc(userDocRef, newUser);
        
      }
    } catch (error) {
     
    }
  }
}