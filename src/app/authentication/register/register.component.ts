import { Component } from '@angular/core';
import { InputFieldComponent } from "../../shared/authentication-input/input-field.component";
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [InputFieldComponent, RouterModule, FormsModule],
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
registerForm: NgForm | undefined;

  constructor(private router: Router) {}

  onSubmit(registerForm: NgForm) {
    this.nameInvalid = !this.name;
    this.emailInvalid = !this.email || !registerForm.controls['email'].valid;
    this.passwordInvalid = !this.password;

    if (registerForm.valid) {      
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

  resetPasswordError() {
    this.passwordInvalid = false;
  }

  resetNameError() {
    this.nameInvalid = false;
  }

  resetEmailError() {
    this.emailInvalid = false;
  }
}