import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessageboardService {

  isMessageBoardOpen: boolean = false;


  openMessageBoard() {
    this.isMessageBoardOpen = true;
  }

  closeMessageBoard() {
    this.isMessageBoardOpen = false;
  }
}
