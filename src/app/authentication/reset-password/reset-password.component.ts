import { Component } from '@angular/core';
import { RestePasswordEmailComponent } from "./reste-password-email/reste-password-email.component";

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [RestePasswordEmailComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {

}
