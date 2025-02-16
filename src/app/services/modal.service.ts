import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  
  private modalState = new BehaviorSubject<boolean>(false);
  modalState$ = this.modalState.asObservable();

  private refreshChannelUsersSource = new BehaviorSubject<boolean>(false);
  refreshChannelUsers$ = this.refreshChannelUsersSource.asObservable();

  triggerRefreshChannelUsers() {
    this.refreshChannelUsersSource.next(true);
  }

  openModal() {
    this.modalState.next(true);
  }

  closeModal() {
    this.modalState.next(false);
  }
}