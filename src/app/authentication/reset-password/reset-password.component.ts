import { Component } from '@angular/core';
import { RestePasswordEmailComponent } from "./reste-password-email/reste-password-email.component";
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { InputFieldComponent } from "../../shared/authentication-input/input-field.component";
import { FormsModule, NgForm } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [RestePasswordEmailComponent, RouterModule, InputFieldComponent, FormsModule, NgClass],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  resetPasswordForm: any;
  password: any;
  newPw: string = '';
  samePw: string = '';

  constructor(private router: Router) { }

  onSubmit(newPassword: NgForm) {

    if(this.newPw === this.samePw){
      console.log(this.samePw,this.newPw, 'gleiches Passwort')
    }else{
      console.log(this.samePw,this.newPw,'nicht das gleiche')
    }

    

  }



}
