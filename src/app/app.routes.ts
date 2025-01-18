import { Routes } from '@angular/router';
import { MainPageComponent } from './main-page/main-page.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { ImprintComponent } from './imprint/imprint.component';


export const routes: Routes = [
  {
    path: '',
    component: AuthenticationComponent
  },
  {
    path: 'chat',
    component: MainPageComponent
  },
  {
    path: 'imprint',
    component: ImprintComponent
  }
];
