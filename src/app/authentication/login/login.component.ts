import { Component } from '@angular/core';
import { InputFieldComponent } from "../../shared/authentication-input/input-field.component";
import { RegisterButtonComponent } from "./register-button/register-button.component";
import { UserServiceService } from '../../services/firebase-services/user-service.service';
import { Observable } from 'rxjs';
import { User } from '../../models/user';
import { ErrorMessages } from '../../shared/authentication-input/error-message';
import { FormsModule } from '@angular/forms';
import { Route, Router, RouterModule } from '@angular/router';
import { GoogleAuthenticationService } from '../../services/firebase-services/google-athentication.servive';
import { LoginService } from '../../services/firebase-services/login-service';
import { LoginUserAcceptedComponent } from "../user-feedback/login-user-accepted/login-user-accepted.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,InputFieldComponent, RegisterButtonComponent, FormsModule, RouterModule, LoginUserAcceptedComponent],
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
  userFound: boolean | undefined = false;
  

  constructor(private userService: UserServiceService,private googleAuthService: GoogleAuthenticationService,private loginService: LoginService,private router: Router) {
    this.users = this.userService.getUsers();
  }

  ngOnInit(): void {
    this.loginService.currentUser.subscribe(user => {
      this.userFound = this.loginService.userFound;
    });
  }


  async guestLogin() {
    try {
      await this.loginService.guestLogin();
      
    } catch (error) {
      console.error('Error during guest login:', error);
    }
  }

  async onSubmit() {
    this.validateEmail();
    this.validatePassword();

    if (!this.emailInvalid && !this.passwordInvalid) {
      try {
        await this.loginService.login(this.email, this.password);
        const userExists = await this.userService.userExists(this.email, this.password);
        if (userExists) {
          console.log('Login erfolgreich');
          
        } else {
          this.emailInvalid = true;
          this.passwordInvalid = true;
          this.passwordErrorMessage = ErrorMessages.passwordLogin;
        }
      } catch (error) {
        this.emailInvalid = true;
        this.passwordInvalid = true;
        this.passwordErrorMessage = ErrorMessages.passwordLogin;
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

  signInWithGoogle() {
    this.googleAuthService.signInWithGoogle();
    this.userFound = true;
        setTimeout(() => {
          this.userFound = false;
          this.router.navigate(['/chat']);
        }, 2000);
  }


  logout(){
    this.loginService.logout();
  }
}