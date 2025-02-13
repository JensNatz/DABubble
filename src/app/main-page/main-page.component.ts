import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../shared/header/header.component';
import { WorkspaceMenuComponent } from './workspace-menu/workspace-menu.component';
import { MessageBoardComponent } from './message-board/message-board.component';
import { CommonModule } from '@angular/common';
import { MessageboardService } from '../services/messageboard.service';
import { LoginService } from '../services/firebase-services/login-service';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    HeaderComponent,
    WorkspaceMenuComponent,
    MessageBoardComponent,
    CommonModule,
  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss'
})
export class MainPageComponent {

  messageboardService: MessageboardService = inject(MessageboardService);
  loginService: LoginService = inject(LoginService);
  isMenuOpen = true;
  isMessageBoardOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  get menuText() {
    return this.isMenuOpen ? 'schließen' : 'öffnen';
  }

}
