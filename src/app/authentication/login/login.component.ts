import { Component } from '@angular/core';
import { InputFieldComponent } from "../../shared/authentication-input/input-field.component";
import { RegisterButtonComponent } from "./register-button/register-button.component";
import { UserServiceService } from '../../services/firebase-services/user-service.service';
import { Observable } from 'rxjs';
import { User } from '../../models/user';
import { ErrorMessages } from '../../shared/authentication-input/error-message';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GoogleAuthenticationService } from '../../services/firebase-services/google-athentication.servive';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [InputFieldComponent, RegisterButtonComponent, FormsModule, RouterModule],
  providers: [UserServiceService, GoogleAuthenticationService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss', '../../shared/authentication-input/input-field.component.scss']
})
export class LoginComponent {
  usernameInvalid: boolean | undefined;
  users: Observable<User[]>;
  email: string = '';
  password: string = '';
  emailInvalid: boolean = false;
  passwordInvalid: boolean = false;
  emailErrorMessage: string = ErrorMessages.emailInvalid;
  passwordErrorMessage: string = ErrorMessages.passwordLogin;
  

  constructor(private userService: UserServiceService,private googleAuthService: GoogleAuthenticationService) {
    this.users = this.userService.getUsers();
  }

  guestLogin() {
    this.users.subscribe(users => {
      console.log(users);
    });
  }

  async onSubmit() {
    this.validateEmail();
    this.validatePassword();

    if (!this.emailInvalid && !this.passwordInvalid) {
      try {
        const userExists = await this.userService.userExists(this.email, this.password);
        if (userExists) {
          console.log('Login erfolgreich');

        } else {
          this.emailInvalid = true;
          this.passwordInvalid = true;
          this.passwordErrorMessage = ErrorMessages.passwordLogin;
        }
      } catch (error) {
        console.error('Fehler beim Login:', error);
      }
    } else {
      console.log('Formular ist ungültig');
    }
  }



  validateEmail() {
    if (!this.email) {
      this.emailInvalid = true;
      this.emailErrorMessage = ErrorMessages.emailInvalid;
    } else {
      this.emailInvalid = false;
    }
  }

  validatePassword() {
    if (!this.password) {
      this.passwordInvalid = true;
      this.passwordErrorMessage = ErrorMessages.passwordLogin;
    } else {
      this.passwordInvalid = false;
    }
  }


  async sendPasswordResetEmail() {
    await this.userService.sendPasswordResetEmail(this.email);
    console.log('password login');
    console.log(this.email);
  }

  signInWithGoogle() {
    this.googleAuthService.signInWithGoogle();
  }

}