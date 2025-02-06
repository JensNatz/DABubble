import { Component } from '@angular/core';
import { HeaderComponent } from '../shared/header/header.component';
import { WorkspaceMenuComponent } from './workspace-menu/workspace-menu.component';
import { MessageBoardComponent } from './message-board/message-board.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    HeaderComponent,
    WorkspaceMenuComponent,
    MessageBoardComponent,
    CommonModule
  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss'
})
export class MainPageComponent {
  isOpen = true;

  toggleMenu() {
    this.isOpen = !this.isOpen;
  }

  get menuText() {
    return this.isOpen ? 'schließen' : 'öffnen';
  }
}
