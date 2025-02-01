import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UserServiceService } from '../../../services/firebase-services/user-service.service';
import { ErrorMessages } from '../../../shared/authentication-input/error-message';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { InputFieldComponent } from '../../../shared/authentication-input/input-field.component';
import { RouterModule,Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { EmailSendComponent } from "../../user-feedback/email-send/email-send.component";
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-reste-password-email',
  imports: [InputFieldComponent, RouterModule, FormsModule, NgClass, EmailSendComponent, CommonModule, RouterModule],
  templateUrl: './reste-password-email.component.html',
  styleUrls: ['./reste-password-email.component.scss']
})
export class RestePasswordEmailComponent {
  email: string = '';
  emailInvalid: boolean = false;
  emailErrorMessage: string = ErrorMessages.emailInvalid;
  isSubmitting:boolean = false;
  emailSend:boolean = false;


  constructor(private userService: UserServiceService, private router:Router) { }



  async validateEmail() {
    if (!this.email) {
      this.emailInvalid = true;
      this.emailErrorMessage = ErrorMessages.emailInvalid;
    } else if (!await this.userService.emailExists(this.email)) {
      this.emailInvalid = true
      this.emailErrorMessage = ErrorMessages.emailNotFound;
    }
    else {
      this.emailInvalid = false;
    }
  }

  async onSubmit(form: NgForm) {
    await this.validateEmail();

    if (form.valid && !this.emailInvalid) {
      this.isSubmitting = true;
      try {
        await this.userService.sendPasswordResetEmail(this.email);
        this.emailSend = true
        setTimeout(() => {
          this.emailSend = false;
          this.router.navigate([''])
        }, 2000);
      } catch (error) {
       
      } 
    }
  }
}