import { Component } from '@angular/core';
import { RestePasswordEmailComponent } from "./reste-password-email/reste-password-email.component";
import { ActivatedRoute, Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { InputFieldComponent } from "../../shared/authentication-input/input-field.component";
import { FormsModule, NgForm } from '@angular/forms';
import { NgClass } from '@angular/common';
import { UserServiceService } from '../../services/firebase-services/user-service.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [RouterModule, InputFieldComponent, FormsModule, NgClass],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  newPassword: string = '';
  confirmPassword: string = '';
  resetCode: string = '';
  email: string = '';
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserServiceService
  ) {}
  onSubmit(newPassword: NgForm) {

    

  }

  ngOnInit(): void {
    this.resetCode = this.route.snapshot.queryParams['oobCode'];
    this.verifyResetCode();
  }

  async verifyResetCode() {
    try {
      this.email = await this.userService.verifyPasswordResetCode(this.resetCode);
    } catch (error) {
      this.errorMessage = 'Invalid or expired password reset code.';
    }
  }

  async resetPassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    try {
      await this.userService.confirmPasswordReset(this.resetCode, this.newPassword);
      this.router.navigate(['/login']);
    } catch (error) {
      this.errorMessage = 'Error resetting password.';
    }
  }

}
