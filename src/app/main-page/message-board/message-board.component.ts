import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeSeperatorComponent } from '../time-seperator/time-seperator.component';
import { MessageComponent } from '../message/message.component';
import { Message } from '../../models/message';
@Component({
  selector: 'app-message-board',
  standalone: true,
  imports: [MessageComponent, TimeSeperatorComponent, CommonModule],
  templateUrl: './message-board.component.html',
  styleUrl: './message-board.component.scss'
})
export class MessageBoardComponent {

  messages: Message[] = [];

  constructor() {
    this.messages = [
      { id: '1', content: 'Hello, how are you?', timestamp: 1735984853000, isOwn: true, userId: '1' },
      { id: '2', content: 'I am fine, thank you!', timestamp: 1736157653000, isOwn: false, userId: '2' },
      { id: '3', content: 'Hello, how are you?', timestamp: 1737108053000, isOwn: true, userId: '1' },
      { id: '4', content: 'I am fine, thank you!', timestamp: 1737140453000, isOwn: false, userId: '2' },
      { id: '5', content: 'Nice!', timestamp: 1737196846000, isOwn: true, userId: '2' },
    ];
  }

  isSameDay(timestamp1: number, timestamp2: number): boolean {
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);
    return date1.toDateString() === date2.toDateString();
  }

}
