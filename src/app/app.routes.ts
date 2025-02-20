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
import { AuthGuard, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['']);

export const routes: Routes = [
  { 
    path: '', 
    title: 'DaBubble - Login',
    component: AuthenticationComponent,
    resolve: {
      platformCheck: () => isPlatformBrowser(PLATFORM_ID)
    }
  },
  { path: 'register', 
    title: 'DaBubble - Registrierung',
    component: RegisterComponent },
  { path: 'register/avatar', 
    title: 'DaBubble - Avatar',
    component: AvatarComponent },
  { path: 'resetpw-email', 
    title: 'DaBubble - Passwort vergessen',
    component: RestePasswordEmailComponent },
  { path: 'resetpw', 
    title: 'DaBubble - Passwort zurücksetzen',
    component: ResetPasswordComponent },
  { path: 'animation', 
    title: 'DaBubble - Startseite',
    component: DaBubbleAnimationComponent },
  {
    path: 'chat',
    title: 'DaBubble - Chat',
    component: MainPageComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'imprint',
    title: 'DaBubble - Impressum',
    component: ImprintComponent
  },
  {
    path: 'privacy-police',
    title: 'DaBubble - Datenschutz',
    component: PrivacyPolicyComponent
  }
];
