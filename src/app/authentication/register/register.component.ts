import { Component } from '@angular/core';
import { InputFieldComponent } from "../../shared/authentication-input/input-field.component";
import { FormsModule } from '@angular/forms';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [InputFieldComponent,RouterModule,FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss', '../../shared/authentication-input/input-field.component.scss']
})
export class RegisterComponent {
onSubmit: any;
usernameInvalid: boolean | undefined;
passwordInvalid: boolean | undefined;

}
