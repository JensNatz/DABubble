import { Component } from '@angular/core';
import { InputFieldComponent } from "../shared/input-field/input-field.component";
import { RegisterButtonComponent } from "./register-button/register-button.component";


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [InputFieldComponent, RegisterButtonComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss','../shared/scss/input-field.scss',]
})
export class LoginComponent {
onSubmit: any;
usernameInvalid: boolean | undefined;


}
