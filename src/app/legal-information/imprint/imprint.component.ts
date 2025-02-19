import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DaBubbleHeaderAuthenticationComponent } from "../../shared/da-bubble-header-authentication/da-bubble-header-authentication.component";

@Component({
  selector: 'app-imprint',
  standalone: true,
  imports: [RouterModule, DaBubbleHeaderAuthenticationComponent],
  templateUrl: './imprint.component.html',
  styleUrl: './imprint.component.scss'
})
export class ImprintComponent {
  constructor(private location: Location) {}

 
  goBack(): void {
    this.location.back();
  }
}
