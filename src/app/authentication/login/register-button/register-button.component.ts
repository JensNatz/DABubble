import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register-button',
  standalone: true,
  imports: [RouterModule,FormsModule],
  templateUrl: './register-button.component.html',
  styleUrl: './register-button.component.scss'
})
export class RegisterButtonComponent {
  
}
