import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UserServiceService } from '../../../services/firebase-services/user-service.service';
import { ErrorMessages } from '../../../shared/authentication-input/error-message';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { InputFieldComponent } from '../../../shared/authentication-input/input-field.component';
import { RouterModule } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-reste-password-email',
  imports: [InputFieldComponent, RouterModule, FormsModule, NgClass],
  templateUrl: './reste-password-email.component.html',
  styleUrls: ['./reste-password-email.component.scss']
})
export class RestePasswordEmailComponent {
  email: string = '';
  emailInvalid: boolean = false;
  emailErrorMessage: string = ErrorMessages.emailInvalid;

  constructor(private userService: UserServiceService) {}

  validateEmail() {
    if (!this.email) {
      this.emailInvalid = true;
      this.emailErrorMessage = ErrorMessages.emailInvalid;
    } else if (this.email.indexOf('@') === -1) {
      this.emailInvalid = true;
      this.emailErrorMessage = ErrorMessages.emailMissingAt;
    } else {
      this.emailInvalid = false;
    }
  }

  async onSubmit(form: NgForm) {
    this.validateEmail();

    if (form.valid && !this.emailInvalid) {
      try {
        await this.userService.sendPasswordResetEmail(this.email);
        console.log('Password reset email sent');
      } catch (error) {
        console.error('Error sending password reset email:', error);
      }
    } else {
      console.log('Form is invalid');
    }
  }
}