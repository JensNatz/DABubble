import { CommonModule } from '@angular/common';
import { Component, inject  } from '@angular/core';
import { LoginService } from '../../services/firebase-services/login-service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule
],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  public showProfilMenu: boolean = false;
  public showProfil: boolean = false;

  userName: string = '';
  userAvatar: string = '';
  userEmail: string = '';
  userStatus: string = '';

  constructor( ) {
    this.getCurrentUserData();
  }

  loginService: LoginService = inject(LoginService);

  getCurrentUserData() {
    this.loginService.currentUser.subscribe(user => {
      if(user){
        this.userName = user.name;        
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

}
