import { Component } from '@angular/core';
import { InputFieldComponent } from "../../shared/authentication-input/input-field.component";
import { RegisterButtonComponent } from "./register-button/register-button.component";


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [InputFieldComponent, RegisterButtonComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss','../../shared/authentication-input/input-field.component.scss',]
})
export class LoginComponent {
onSubmit: any;
usernameInvalid: boolean | undefined;


}
