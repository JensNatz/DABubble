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

  constructor(private firestore: Firestore, private userService: UserServiceService) {}

  async signInWithGoogle(): Promise<void> {
    try {
      const result = await signInWithPopup(this.auth, this.provider);
      
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
    
      const user = result.user;
      console.log('User signed in:', user);

      // Erstellen Sie ein User-Objekt basierend auf Ihrem Modell
      const newUser: User = {
        id: user.uid,
        email: user.email || '',
        name: user.displayName || '',
        avatar: user.photoURL || '',
        password: '', // Passwort wird nicht von Google bereitgestellt
        onlineStatusbar: 'online' // Standardwert setzen
      };

      // Speichern Sie die Benutzerdaten in Firestore
      await this.userService.addNewUser(newUser);

      // IdP data available using getAdditionalUserInfo(result)
      // ...
    } catch (error) {
      
    }
  }
}