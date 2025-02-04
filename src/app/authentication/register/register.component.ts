import { Component, OnInit } from '@angular/core';
import { InputFieldComponent } from "../../shared/authentication-input/input-field.component";
import { FormsModule, NgForm, FormBuilder, FormGroup, Validators, ReactiveFormsModule, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { UserServiceService } from '../../services/firebase-services/user-service.service';
import { ErrorMessages } from '../../shared/authentication-input/error-message';
import { NgClass } from '@angular/common';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [InputFieldComponent, RouterModule, FormsModule, NgClass, ReactiveFormsModule],
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
  nameErrorMessage: string = ErrorMessages.nameRequired;
  emailErrorMessage: string = ErrorMessages.emailInvalid;
  passwordErrorMessage: string = ErrorMessages.passwordInvalid;
  registerForm: any;

  constructor(private fb: FormBuilder, private router: Router, private userService: UserServiceService) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(4), this.fullNameValidator()]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)]],
      password: ['', [Validators.required, this.passwordValidator()]],
      dataProtection: [false, Validators.requiredTrue]
    });
  }

  async onSubmit() {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid) {
      this.validateForm();
      return;
    }

    const { name, email, password } = this.registerForm.value;

    console.log('Formular erfolgreich übermittelt');
    this.router.navigate(['/register/avatar'], {
      queryParams: { name, email, password }
    });
  }



  onBlur(field: string) {
    const control = this.registerForm.get(field);
    if (control) {
      control.markAsTouched();
      this.validateForm();
    }
  }

  validateForm() {
    const controls = this.registerForm.controls;

    if (controls['name'].invalid && controls['name'].touched) {
      if (controls['name'].errors?.required) {
        this.nameErrorMessage = ErrorMessages.nameRequired;
      } else if (controls['name'].errors?.minlength) {
        this.nameErrorMessage = ErrorMessages.nameMinLength;
      }
    }

    if (controls['email'].invalid && controls['email'].touched) {
      if (controls['email'].errors?.required) {
        this.emailErrorMessage = ErrorMessages.emailInvalid;
      } else if (controls['email'].errors?.email) {
        this.emailErrorMessage = ErrorMessages.emailMissingAt;
      }
    }

    if (controls['password'].invalid && controls['password'].touched) {
      if (controls['password'].errors?.required) {
        this.passwordErrorMessage = ErrorMessages.passwordInvalid;
      } else if (controls['password'].errors?.minlength) {
        this.passwordErrorMessage = ErrorMessages.passwordMinLength;
      } else if (controls['password'].errors?.pattern) {
        if (!/[A-Z]/.test(controls['password'].value)) {
          this.passwordErrorMessage = ErrorMessages.passwordCapitalLetter;
        } else if (!/[!@#$%^&*]/.test(controls['password'].value)) {
          this.passwordErrorMessage = ErrorMessages.passwordSpecialCharacters;
        }
      }
    }
  }

  passwordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value || '';

      if (value.length < 5) {
        this.passwordErrorMessage = ErrorMessages.passwordMinLength;
        return { minlength: { requiredLength: 5, actualLength: value.length } };
      }
      if (!/[A-Z]/.test(value)) {
        this.passwordErrorMessage = ErrorMessages.passwordCapitalLetter;
        return { missingCapitalLetter: true };
      }
      if (!/[!@#$%^&*]/.test(value)) {
        this.passwordErrorMessage = ErrorMessages.passwordSpecialCharacters;
        return { missingSpecialCharacter: true };
      }
      return null;
    };
  }

  fullNameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value || '';
      const hasTwoWords = value.trim().split(/\s+/).length >= 2;
      return hasTwoWords ? null : { fullName: true };
    };
  }

}