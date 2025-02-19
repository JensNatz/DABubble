import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { DaBubbleHeaderAuthenticationComponent } from "../../shared/da-bubble-header-authentication/da-bubble-header-authentication.component";

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [RouterModule, DaBubbleHeaderAuthenticationComponent],
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent {
  constructor(private location: Location){} 
  
  goBack(): void {
    this.location.back();
  }
}
