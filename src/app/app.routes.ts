import { Routes } from '@angular/router';
import { MainPageComponent } from './main-page/main-page.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { ImprintComponent } from './legal-information/imprint/imprint.component';
import { RegisterComponent } from './authentication/register/register.component';
import { AvatarComponent } from './authentication/avatar/avatar.component';
import { RestePasswordEmailComponent } from './authentication/reset-password/reste-password-email/reste-password-email.component';
import { ResetPasswordComponent } from './authentication/reset-password/reset-password.component';
import { PrivacyPolicyComponent } from './legal-information/privacy-policy/privacy-policy.component';
import { DaBubbleAnimationComponent } from './shared/da-bubble-animation/da-bubble-animation.component';

export const routes: Routes = [
  { path: '', component: AuthenticationComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'register/avatar', component: AvatarComponent },
  { path: 'resetpw-email', component: RestePasswordEmailComponent },
  { path: 'resetpw', component: ResetPasswordComponent },
  { path: 'animation', component: DaBubbleAnimationComponent },
  {
    path: 'chat',
    component: MainPageComponent
  },
  {
    path: 'imprint',
    component: ImprintComponent
  },
  {
    path: 'privacy-police',
    component: PrivacyPolicyComponent
  }
];
