import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { LoginService } from '../../services/firebase-services/login-service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SearchComponent } from '../../main-page/search/search.component';
import { AvatarComponent } from '../avatar/avatar.component';
import { MessageboardService } from '../../services/messageboard.service';
import { ChannelServiceService } from '../../services/firebase-services/channel-service.service';
import { MenuProfilComponent } from '../menu-profil/menu-profil.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SearchComponent,
    AvatarComponent,
    MenuProfilComponent,
    AvatarComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  messageboardService: MessageboardService = inject(MessageboardService);
  loginService: LoginService = inject(LoginService);
  channelService: ChannelServiceService = inject(ChannelServiceService);

  @Output() backButtonClicked = new EventEmitter<void>();

  public showProfilMenu: boolean = false;
  public showProfil: boolean = false;
  public showEditProfil: boolean = false;

  userId: any = '';
  userName: string = '';
  tempUserName: string = '';
  userAvatar: string = '';
  userOnlineStatus: string = '';
  userEmail: string = '';
  userStatus: string = '';
  selectedAvatar: string = '';
  avatar: string = '';
  avatarKey: string = '';

  avatarImages = ['1', '2', '3', '4', '5', '6']
 
  constructor(private router: Router) {
  }

  ngOnInit() {
    this.getCurrentUserData();
  }


  selectAvatar(avatar: string) {
    this.selectedAvatar = avatar;
  }

  getCurrentUserData() {
    this.loginService.currentUser.subscribe(user => {
      if (user) {
        this.userId = user.id;
        this.userName = user.name;
        this.tempUserName = user.name;
        this.selectedAvatar = user.avatar;
        this.userEmail = user.email;
        this.userOnlineStatus = user.onlineStatusbar;
      } else {
        this.userAvatar = '0';
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
    this.tempUserName = this.userName;
    this.showEditProfil = true;
  }


  closeEditProfil() {
    this.userName = this.tempUserName;
    this.showEditProfil = false;
    this.closeProfil();
  }


  updateUserNameAndAvatar(newName: string) {
    if (!newName.trim()) return;
  
    try {
      this.userName = newName;
      this.tempUserName = newName;      
      this.loginService.editUserNameAndAvatar(this.userId, newName, this.selectedAvatar);      
      this.closeEditProfil();
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Namens und Avatars:', error);
    }
  }


  logOut() {
    this.loginService.logout();
    this.channelService.clearCurrentChannel();
    this.router.navigate(['']);
  }

  onBackButtonClick() {
    this.messageboardService.closeMessageBoard();
  }
}
