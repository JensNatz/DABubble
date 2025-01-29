import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  public showProfilMenu: boolean = false;
  public showProfil: boolean = false;


  openProfilMenu() {
    this.showProfilMenu = true;
  }


  closeProfilMenu() {
    this.showProfilMenu = false;
  }


  openProfil() {
    this.showProfil = true;
  }


  closeProfil() {
    this.showProfil = false;
  }

}
