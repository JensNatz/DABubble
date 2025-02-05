import { Component } from '@angular/core';
import { RestePasswordEmailComponent } from "./reste-password-email/reste-password-email.component";
import { ActivatedRoute, Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { InputFieldComponent } from "../../shared/authentication-input/input-field.component";
import { ErrorMessages } from '../../shared/authentication-input/error-message';
import { CommonModule, NgClass } from '@angular/common';
import { UserServiceService } from '../../services/firebase-services/user-service.service';
import { FormsModule, NgForm, FormBuilder, FormGroup, Validators, ReactiveFormsModule, ValidatorFn, AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';


@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [RouterModule, InputFieldComponent, FormsModule, NgClass, ReactiveFormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  newPassword:string ='';
  confirmPassword: string = '';
  resetCode: string = '';
  email: string = '';
  errorMessage: string = '';
  newPasswordForm: any;
  passwordErrorMessage: string = ErrorMessages.passwordNotTheSame;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserServiceService
  ) {}

  ngOnInit(): void {
    this.newPasswordForm = this.fb.group({
      newpw: ['', Validators.required],
      samepw: ['', Validators.required]
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
      this.router.navigate(['/login']);
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
}