import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessageboardService {

  isMessageBoardOpen: boolean = false;

  constructor() { }

  toggleMessageBoard() {
    this.isMessageBoardOpen = !this.isMessageBoardOpen;
  }

  openMessageBoard() {
    this.isMessageBoardOpen = true;
  }

  closeMessageBoard() {
    this.isMessageBoardOpen = false;
  }
}
