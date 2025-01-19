import { Component } from '@angular/core';
import { InputFieldComponent } from "../shared/input-field/input-field.component";


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [InputFieldComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss', '../shared/scss/btn-scss.scss']
})
export class LoginComponent {
onSubmit: any;


}
