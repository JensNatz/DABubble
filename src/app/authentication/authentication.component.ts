import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, NgIf } from '@angular/common';
import { LoginComponent } from "./login/login.component";
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-authentication',
  standalone: true,
  imports: [LoginComponent,RouterModule,NgIf],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.scss'
})
export class AuthenticationComponent {
  isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }
}
