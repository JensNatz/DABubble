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

  private channelNameSource = new BehaviorSubject<string>('');
  channelName$ = this.channelNameSource.asObservable();

  private channelDescriptionSource = new BehaviorSubject<string>('');
  channelDescription$ = this.channelDescriptionSource.asObservable();
  

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

  updateChannelName(newName: string) {
    this.channelNameSource.next(newName);
  }

  updateChannelDescription(newDescription: string) {
    this.channelDescriptionSource.next(newDescription);
  }
}
