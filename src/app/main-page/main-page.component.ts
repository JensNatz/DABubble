import { Component, inject, OnDestroy } from '@angular/core';
import { HeaderComponent } from '../shared/header/header.component';
import { WorkspaceMenuComponent } from './workspace-menu/workspace-menu.component';
import { MessageBoardComponent } from './message-board/message-board.component';
import { CommonModule } from '@angular/common';
import { MessageboardService } from '../services/messageboard.service';
import { ModalUserAddComponent } from '../shared/modal-user-add/modal-user-add.component';
import { ModalService } from '../services/modal.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    HeaderComponent,
    WorkspaceMenuComponent,
    MessageBoardComponent,
    CommonModule,
    ModalUserAddComponent
  ],
  providers: [ MessageBoardComponent ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss'
})
export class MainPageComponent implements OnDestroy {

  messageboardService: MessageboardService = inject(MessageboardService);
  isMenuOpen = true;
  isMessageBoardOpen = false;

  showModalUserEdit = false;
  private modalSubscription: Subscription;

  constructor(private modalService: ModalService) {
    this.modalSubscription = this.modalService.modalState$.subscribe(state => {
      this.showModalUserEdit = state;
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  get menuText() {
    return this.isMenuOpen ? 'schließen' : 'öffnen';
  }

  ngOnDestroy() {
    this.modalSubscription.unsubscribe();
  }

}
