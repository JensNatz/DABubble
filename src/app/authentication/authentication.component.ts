import { Component } from '@angular/core';
import { LoginComponent } from "./login/login.component";
import { ImprintComponent } from "../legal-information/imprint/imprint.component";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-authentication',
  standalone: true,
  imports: [LoginComponent, ImprintComponent,RouterModule],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.scss'
})
export class AuthenticationComponent {

}
