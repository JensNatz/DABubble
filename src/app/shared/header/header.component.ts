import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { LoginService } from '../../services/firebase-services/login-service';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  public showProfilMenu: boolean = false;
  public showProfil: boolean = false;
  public showEditProfil: boolean = false;

  userId: any = '';
  userName: string = '';
  tempUserName: string = '';
  userAvatar: string = '';
  userEmail: string = '';
  userStatus: string = '';

  constructor(private firestore: Firestore) {
    this.getCurrentUserData();
  }

  loginService: LoginService = inject(LoginService);

  getCurrentUserData() {
    this.loginService.currentUser.subscribe(user => {
      if (user) {
        this.userId = user.id;
        this.userName = user.name;
        this.tempUserName = user.name; // Originalname speichern
        this.userAvatar = user.avatar;
        this.userEmail = user.email;
        this.userStatus = user.onlineStatusbar;
      }
    })
  }

  openProfilMenu() {
    this.showProfilMenu = true;
  }


  closeProfilMenu() {
    this.showProfilMenu = false;
  }


  openProfil() {
    this.showProfil = true;
  }


  closeProfil() {
    this.showProfil = false;
  }

  openEditProfil() {
    this.tempUserName = this.userName; // Originalwert zwischenspeichern
    this.showEditProfil = true;
  }


  closeEditProfil() {
    this.userName = this.tempUserName; // Originalwert wiederherstellen
    this.showEditProfil = false;
    this.closeProfil();
  }

  updateUserName(newName: string) {   
    if (!newName.trim()) return; 
    try {
      this.userName = newName;
      this.tempUserName = newName; // Sicherstellen, dass der neue Wert gespeichert bleibt
      this.loginService.editUserName(this.userId, newName);
      this.closeEditProfil();
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Namens:', error);
    }  
  }
}
