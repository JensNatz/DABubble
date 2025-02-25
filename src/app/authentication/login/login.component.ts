import { Component } from '@angular/core';
import { InputFieldComponent } from "../../shared/authentication-input/input-field.component";
import { RegisterButtonComponent } from "./register-button/register-button.component";
import { UserServiceService } from '../../services/firebase-services/user-service.service';
import { Observable } from 'rxjs';
import { User } from '../../models/user';
import { ErrorMessages } from '../../shared/authentication-input/error-message';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn, ReactiveFormsModule } from '@angular/forms';
import { Route, Router, RouterModule } from '@angular/router';
import { GoogleAuthenticationService } from '../../services/firebase-services/google-athentication.servive';
import { LoginService } from '../../services/firebase-services/login-service';
import { LoginUserAcceptedComponent } from "../user-feedback/login-user-accepted/login-user-accepted.component";
import { CommonModule } from '@angular/common';
import { LegalInformationComponent } from "../../legal-information/legal-information.component";
import { DaBubbleHeaderAuthenticationComponent } from "../../shared/da-bubble-header-authentication/da-bubble-header-authentication.component";
import { DaBubbleAnimationComponent } from "../../shared/da-bubble-animation/da-bubble-animation.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, InputFieldComponent, RegisterButtonComponent, RouterModule, LoginUserAcceptedComponent, LegalInformationComponent, DaBubbleHeaderAuthenticationComponent, DaBubbleAnimationComponent],
  providers: [UserServiceService, GoogleAuthenticationService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss', '../../shared/authentication-input/input-field.component.scss', '../shared/responsiv-authentication.scss']
})
export class LoginComponent {
  usernameInvalid: boolean | undefined;
  users: Observable<User[]>;
  passwordInvalid: boolean = false;

  passwordErrorMessage: string = ErrorMessages.passwordLogin;
  userFound: boolean | undefined = false;
  emptyLogin: boolean = false;
  animationPlayed: boolean = true;
  errorMessage: string = '';
  isSubmitting: boolean = true;
  loginForm: FormGroup = new FormGroup({});
  emailTouched: boolean = false;
  passwordTouched: boolean = false;
  emailInvalid:boolean = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserServiceService,
    private googleAuthService: GoogleAuthenticationService,
    private loginService: LoginService,
    private router: Router
  ) {
    this.users = this.userService.getUsers();
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    
    this.loginForm.valueChanges.subscribe(() => {
      this.checkUserExists();

      if (this.emailInvalid || this.passwordInvalid) {
        this.emailInvalid = false;
        this.passwordInvalid = false;
        this.errorMessage = '';
      }
    });

  }

  async checkUserExists() {
    const email = this.loginForm.get('email')?.value.toLowerCase();
    const password = this.loginForm.get('password')?.value;

    if (password) {
      const userExists = await this.userService.userExists(email, password);
      this.isSubmitting = !userExists;
      return userExists;
    } else {
      this.isSubmitting = true;
      this.passwordInvalid = false;
      return false;
    }
  }

  async guestLogin() {
    try {
      await this.loginService.guestLogin();      
      this.userFound = true;
        setTimeout(() => {
          this.userFound = false;
          this.router.navigate(['/chat']);
        }, 2000);
     
    } catch (error) {     
    }
  }

  async onSubmit() {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) {
      return;
    }

    const email = this.loginForm.get('email')?.value.toLowerCase();
    const password = this.loginForm.get('password')?.value;

    try {
      const userExists = await this.userService.userExists(email, password);
      if (userExists) {
        await this.loginService.login(email, password);
        this.userFound = true;
        setTimeout(() => {
          this.userFound = false;
          this.router.navigate(['/chat']);
        }, 2000);
      } else {
        this.passwordInvalid = true;
        this.errorMessage = ErrorMessages.passwordLogin;
      }
    } catch (error) {
      
    }
  }

  signInWithGoogle() {
    this.googleAuthService.signInWithGoogle();
    this.userFound = true;
    setTimeout(() => {
      this.userFound = false;
      this.router.navigate(['/chat']);
    }, 4000);
  }

  logout() {
    this.loginService.logout();
  }

  async onBlur(field: string) {
    const control = this.loginForm.get(field);
    if (control) {
      control.markAsTouched();
  
      if (field === 'email') {
       
        if (control.invalid) {
          this.emailInvalid = true;
          this.errorMessage = ErrorMessages.passwordLogin; 
        } else {
          this.emailInvalid = false;
        }
      }
  
      if (field === 'password') {
        
        const userExists = await this.checkUserExists();
        if (!userExists) {
          this.passwordInvalid = true;
          this.errorMessage = ErrorMessages.passwordLogin; 
        } else {
          this.passwordInvalid = false;
        }
      }
    }
  }
}