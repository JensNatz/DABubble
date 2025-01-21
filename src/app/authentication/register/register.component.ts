import { Component } from '@angular/core';
import { InputFieldComponent } from '../shared/input-field/input-field.component';
import { FormsModule } from '@angular/forms';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [InputFieldComponent,RouterModule,FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
onSubmit: any;
usernameInvalid: boolean | undefined;
passwordInvalid: boolean | undefined;

}
