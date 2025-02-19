import { Component, inject, Input } from '@angular/core';
import { ChannelServiceService } from '../../services/firebase-services/channel-service.service';
import { Subscription } from 'rxjs';
import { LoginService } from '../../services/firebase-services/login-service';
import { UserServiceService } from '../../services/firebase-services/user-service.service';
import { User } from '../../models/user';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchService } from '../../services/search.service';
import { take } from 'rxjs/operators';
import { AddUserToChannelComponent } from '../add-user-to-channel/add-user-to-channel.component';
import { ModalService } from '../../services/modal.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu-profil',
  standalone: true,
  imports: [],
  templateUrl: './menu-profil.component.html',
  styleUrl: './menu-profil.component.scss'
})
export class MenuProfilComponent {

  @Input() openProfil!: () => void;

  loginService: LoginService = inject(LoginService);

  constructor(private router: Router) {
  }

  logOut() {
    this.loginService.logout();
    this.router.navigate(['']);
  }
}
