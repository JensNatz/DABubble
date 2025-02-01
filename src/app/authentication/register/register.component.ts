import { Component } from '@angular/core';
import { InputFieldComponent } from "../../shared/authentication-input/input-field.component";
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { UserServiceService } from '../../services/firebase-services/user-service.service';
import { ErrorMessages } from '../../shared/authentication-input/error-message';
import { NgClass } from '@angular/common';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [InputFieldComponent, RouterModule, FormsModule, NgClass],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss', '../../shared/authentication-input/input-field.component.scss']
})
export class RegisterComponent {
  name: string = '';
  email: string = '';
  password: string = '';
  dataProtection: boolean = false;
  nameInvalid: boolean = false;
  emailInvalid: boolean = false;
  passwordInvalid: boolean = false;
  nameErrorMessage: string = ErrorMessages.nameRequired;
  emailErrorMessage: string = ErrorMessages.emailInvalid;
  passwordErrorMessage: string = ErrorMessages.passwordInvalid;


  constructor(private router: Router, private userService: UserServiceService) { }

  async onSubmit(registerForm: NgForm) {
    this.validateName();
    this.emailInvalid = !this.email || !registerForm.controls['email'].valid;
    this.validatePassword();
    await this.validateEmail();

    if (registerForm.valid && !this.emailInvalid && !this.nameInvalid && !this.passwordInvalid) {
      console.log('Formular erfolgreich übermittelt');

      this.router.navigate(['/register/avatar'], {
        queryParams: {
          name: this.name,
          email: this.email,
          password: this.password
        }
      });
    } else {
      console.log('Formular ist ungültig');
    }
  }

  async validateEmail() {
    if (!this.email) {
      this.emailInvalid = true;
      this.emailErrorMessage = ErrorMessages.emailInvalid;
      return;
    } else if (this.email.indexOf('@') === -1) {
      this.emailInvalid = true;
      this.emailErrorMessage = ErrorMessages.emailMissingAt;
      return;
    }

    const emailExists = await this.userService.emailExists(this.email);
    if (emailExists) {
      this.emailInvalid = true;
      this.emailErrorMessage = ErrorMessages.emailExists;
    } else {
      this.emailInvalid = false;
    }
  }

  validateName() {
    if (!this.name) {
      this.nameInvalid = true;
      this.nameErrorMessage = ErrorMessages.nameRequired;
    } else if (this.name.length < 3) {
      this.nameInvalid = true;
      this.nameErrorMessage = ErrorMessages.nameMinLength;
    } else {
      this.nameInvalid = false;
    }
  }

  validatePassword() {
    if (!this.password) {
      this.passwordInvalid = true;
      this.passwordErrorMessage = ErrorMessages.passwordInvalid;
    } else if (this.password.length < 5) {
      this.passwordInvalid = true;
      this.passwordErrorMessage = ErrorMessages.passwordMinLength;
    } else if (!/[A-Z]/.test(this.password)) {
      this.passwordInvalid = true;
      this.passwordErrorMessage = ErrorMessages.passwordCapitalLetter;
    } else if (!/[!@#$%^&*]/.test(this.password)) {
      this.passwordInvalid = true;
      this.passwordErrorMessage = ErrorMessages.passwordSpecialCharacters;
    } else {
      this.passwordInvalid = false;
    }
  }

  resetNameError() {
    this.nameInvalid = false;
    this.nameErrorMessage = ErrorMessages.nameRequired;
    this.validateName()
  }

  resetEmailError() {
    this.emailInvalid = false;
    this.emailErrorMessage = ErrorMessages.emailInvalid;
  }

  resetPasswordError() {
    this.passwordInvalid = false;
    this.passwordErrorMessage = ErrorMessages.passwordInvalid;
    this.validatePassword();
  }
}