import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserServiceService } from '../../services/firebase-services/user-service.service';
import { User } from '../../models/user';
import { Route } from '@angular/router';
import { AccountCreatedSuccessfullyComponent } from "../user-feedback/account-created-successfully/account-created-successfully.component";
import { LegalInformationComponent } from "../../legal-information/legal-information.component";
import { DaBubbleHeaderAuthenticationComponent } from "../../shared/da-bubble-header-authentication/da-bubble-header-authentication.component";


@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule, AccountCreatedSuccessfullyComponent, LegalInformationComponent, DaBubbleHeaderAuthenticationComponent],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss'
})
export class AvatarComponent {

  name: string = '';
  email: string = '';
  password: string = '';
  avatar: string = '';
  avatarKey: string = '';
  isSubmitting: boolean = false;
  registrationSuccessful: boolean = false;

  avatarImages = {
    '1': '../../../assets/img/avatar1.svg',
    '2': '../../../assets/img/avatar2.svg',
    '3': '../../../assets/img/avatar3.svg',
    '4': '../../../assets/img/avatar4.svg',
    '5': '../../../assets/img/avatar5.svg',
    '6': '../../../assets/img/avatar6.svg'
  }



  constructor(private route: ActivatedRoute, private router: Router, private UserServiceService: UserServiceService) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.name = params['name'];
      this.email = params['email'];
      this.password = params['password'];
      
      if (!this.name || !this.email || !this.password) {
        this.router.navigate(['/register']);
      }
    });
  }

  selectedAvatar: string = '';


  selectAvatar(avatar: string, avatarKey: string) {
    this.selectedAvatar = avatar;
    this.avatarKey = avatarKey;   
  }


  async registerUser() {
    if (!this.selectedAvatar) {
      return;
    }

    this.isSubmitting = true;

    const newUser: User = {
      name: this.name,
      email: this.email,
      password: this.password,
      avatar: this.avatarKey,
      onlineStatusbar: 'offline'
    };

    try {
      await this.UserServiceService.registerUser(this.email, this.password, newUser);
      //await this.UserServiceService.addNewUser(newUser);
      
      this.registrationSuccessful = true;
      setTimeout(() => {
        this.registrationSuccessful = false;
        this.router.navigate([''])
      }, 2000);
    } catch (err) {
     
    }
  }
}
