import { Injectable } from '@angular/core';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { Firestore } from '@angular/fire/firestore';
import { UserServiceService } from './user-service.service';
import { User } from '../../models/user';

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthenticationService {
  private auth = getAuth();
  private provider = new GoogleAuthProvider();

  constructor(private firestore: Firestore, private userService: UserServiceService) { }

  async signInWithGoogle(): Promise<void> {
    try {
      const result = await signInWithPopup(this.auth, this.provider);

      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      const user = result.user;
      console.log('User signed in:', user);


      const newUser: User = {
        id: user.uid,
        email: user.email || '',
        name: user.displayName || '',
        avatar: user.photoURL || '',
        password: '',
        onlineStatusbar: 'online'
      };
      await this.userService.addNewUser(newUser);
    } catch (error) {

    }
  }
}