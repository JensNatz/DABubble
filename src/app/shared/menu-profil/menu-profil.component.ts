import { Component, inject, Input } from '@angular/core';
import { LoginService } from '../../services/firebase-services/login-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu-profil',
  standalone: true,
  imports: [],
  templateUrl: './menu-profil.component.html',
  styleUrl: './menu-profil.component.scss'
})
export class MenuProfilComponent {

  @Input() openProfil!: () => void;

  loginService: LoginService = inject(LoginService);

  constructor(private router: Router) {
  }

  logOut() {
    this.loginService.logout();
    this.router.navigate(['']);
  }
}
