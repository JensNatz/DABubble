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
  email: string = '';
  password: string = '';
  emailInvalid: boolean = false;
  passwordInvalid: boolean = false;
  emailErrorMessage: string = ErrorMessages.emailInvalid;
  emptyErrorMessage: string = ErrorMessages.emptyLogin;
  passwordErrorMessage: string = ErrorMessages.passwordLogin;
  userFound: boolean | undefined = false;
  emptyLogin: boolean = false;
  animationPlayed: boolean = false;
  errorMessage: string = '';
  isSubmitting: boolean = true;
  loginForm: FormGroup = new FormGroup({});
  emailTouched: boolean = false; // Neu: Speichert, ob das E-Mail-Feld berührt wurde
  passwordTouched: boolean = false;

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
    });
  }

  async checkUserExists() {
    const email = this.loginForm.get('email')?.value;
    const password = this.loginForm.get('password')?.value;

    if (email && password) {
      const userExists = await this.userService.userExists(email, password);
      this.isSubmitting = !userExists;
      if (!userExists) {
        this.passwordInvalid = true;
        this.errorMessage = ErrorMessages.passwordLogin;
      }
    } else {
      this.isSubmitting = true;
      this.passwordInvalid = false;
    }
  }

  async guestLogin() {
    try {
      await this.loginService.guestLogin();
    } catch (error) {
      console.error('Error during guest login:', error);
    }
  }

  async onSubmit() {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) {
      return;
    }

    const { email, password } = this.loginForm.value;

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
      console.error('Error during login:', error);
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

  onBlur(field: string) {
    const control = this.loginForm.get(field);
    if (control) {
      control.markAsTouched();

      // Setze das entsprechende "Touched"-Flag
      if (field === 'email') {
        this.emailTouched = true;
        console.log('d')
      } else if (field === 'password') {
        this.passwordTouched = true;
        console.log('d')
      }

      // Überprüfung nur, wenn beide Felder berührt wurden
      if (this.emailTouched && this.passwordTouched) {
        this.checkUserExists();
        console.log('d')
      }
    }
  }

}