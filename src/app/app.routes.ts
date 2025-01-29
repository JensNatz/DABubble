import { Routes } from '@angular/router';
import { MainPageComponent } from './main-page/main-page.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { ImprintComponent } from './imprint/imprint.component';
import { RegisterComponent } from './authentication/register/register.component';
import { AvatarComponent } from './authentication/avatar/avatar.component';
import { RestePasswordEmailComponent } from './authentication/reset-password/reste-password-email/reste-password-email.component';

export const routes: Routes = [
  { path: '', component: AuthenticationComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'register/avatar', component: AvatarComponent },
  { path: 'resetpw', component: RestePasswordEmailComponent },
  {
    path: 'chat',
    component: MainPageComponent
  },
  {
    path: 'imprint',
    component: ImprintComponent
  }
];
