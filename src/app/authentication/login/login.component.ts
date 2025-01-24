import { Component } from '@angular/core';
import { InputFieldComponent } from "../../shared/authentication-input/input-field.component";
import { RegisterButtonComponent } from "./register-button/register-button.component";
import { UserServiceService } from '../../services/firebase-services/user-service.service';
import { Observable } from 'rxjs';
import { User } from '../../models/user';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [InputFieldComponent, RegisterButtonComponent, FormsModule],
  providers: [UserServiceService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss', '../../shared/authentication-input/input-field.component.scss']
})
export class LoginComponent {
  usernameInvalid: boolean | undefined;
  users: Observable<User[]>;
  email: string = '';
  password: string = '';

  constructor(private userService: UserServiceService) {
    this.users = this.userService.getUsers();
  }

  guestLogin() {
    this.users.subscribe(users => {
      console.log(users);
    });
  }

  async onSubmit() {
    const userExists = await this.userService.userExists(this.email, this.password);
    if (userExists) {
      console.log('Benutzer existiert');
    } else {
      console.log('Benutzer existiert nicht');
    }
  }

  async sendPasswordResetEmail() {
    await this.userService.sendPasswordResetEmail(this.email);
    console.log('Password reset email sent');
  }
  
}