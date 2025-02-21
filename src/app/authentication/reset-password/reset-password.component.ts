import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { InputFieldComponent } from "../../shared/authentication-input/input-field.component";
import { ErrorMessages } from '../../shared/authentication-input/error-message';
import { CommonModule, NgClass, Location } from '@angular/common';
import { UserServiceService } from '../../services/firebase-services/user-service.service';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { LegalInformationComponent } from "../../legal-information/legal-information.component";
import { DaBubbleHeaderAuthenticationComponent } from "../../shared/da-bubble-header-authentication/da-bubble-header-authentication.component";
import { PwResetAcceptedComponent } from "../user-feedback/pw-reset-accepted/pw-reset-accepted.component";

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [RouterModule, InputFieldComponent, FormsModule, NgClass, ReactiveFormsModule, CommonModule, LegalInformationComponent, DaBubbleHeaderAuthenticationComponent, PwResetAcceptedComponent],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  newPassword: string = '';
  confirmPassword: string = '';
  resetCode: string = '';
  email: string = '';
  errorMessage: string = '';
  passwortReset: boolean = false;
  newPasswordForm: any;
  passwordErrorMessage: string = '';
  passwordNotTheSame: string = ErrorMessages.passwordNotTheSame;


  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserServiceService,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.newPasswordForm = this.fb.group({
      newpw: ['', [Validators.required, this.passwordValidator()]],
      samepw: ['', [Validators.required, this.passwordValidator()]]
    }, { validator: this.passwordMatchValidator });

    this.resetCode = this.route.snapshot.queryParams['oobCode'];
    this.verifyResetCode();
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newpw');
    const confirmPassword = control.get('samepw');
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  async verifyResetCode() {
    try {
      const email = await this.userService.verifyPasswordResetCode(this.resetCode);
      console.log(`Reset code verified for email: ${email}`);
    } catch (error) {
      console.error('Error verifying reset code:', error);
    }
  }

  async onSubmit() {
    if (this.newPasswordForm.invalid) {
      return;
    }

    const { newpw, samepw } = this.newPasswordForm.value;

    if (newpw !== samepw) {
      this.passwordErrorMessage = 'Passwörter stimmen nicht überein';
      return;
    }

    try {
      await this.userService.confirmPasswordReset(this.resetCode, newpw);
      console.log('Password reset successfully');
      this.passwortReset = true;
      setTimeout(() => {
        this.passwortReset = false;
        this.router.navigate(['/']);
      }, 2000);
    } catch (error) {
      console.error('Error resetting password:', error);
    }
  }

  onBlur(field: string) {
    const control = this.newPasswordForm.get(field);
    if (control) {
      control.markAsTouched();
    }
  }

  goBack(): void {
    this.location.back();
  }

  passwordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value || '';

      if (value.length < 6) {
        this.passwordErrorMessage = ErrorMessages.passwordMinLength;
        return { minlength: { requiredLength: 6, actualLength: value.length } };
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
}