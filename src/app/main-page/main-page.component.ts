import { Component } from '@angular/core';
import { HeaderComponent } from '../shared/header/header.component';
import { WorkspaceMenuComponent } from './workspace-menu/workspace-menu.component';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    HeaderComponent,
    WorkspaceMenuComponent
  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss'
})
export class MainPageComponent {

}
