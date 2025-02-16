import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  
  private modalState = new BehaviorSubject<boolean>(false);
  modalState$ = this.modalState.asObservable();

  private modalContent = new BehaviorSubject<string | null>(null);
  modalContent$ = this.modalContent.asObservable();

  private refreshChannelUsersSource = new BehaviorSubject<boolean>(false);
  refreshChannelUsers$ = this.refreshChannelUsersSource.asObservable();

  openModal(content: string) {
    this.modalContent.next(content);
    this.modalState.next(true);
  }

  closeModal() {
    this.modalState.next(false);
    this.modalContent.next(null);
  }

  triggerRefreshChannelUsers() {
    this.refreshChannelUsersSource.next(true);
  }
}
