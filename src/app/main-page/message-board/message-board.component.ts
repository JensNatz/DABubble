import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeSeperatorComponent } from '../time-seperator/time-seperator.component';
import { MessageComponent } from '../message/message.component';
import { Message } from '../../models/message';
import { MessageInputComponent } from '../../shared/message-input/message-input.component';
import { MessageServiceService } from '../../services/firebase-services/message-service.service';

@Component({
  selector: 'app-message-board',
  standalone: true,
  imports: [
    CommonModule,
    MessageComponent,
    TimeSeperatorComponent,
    MessageInputComponent
  ],
  templateUrl: './message-board.component.html',
  styleUrl: './message-board.component.scss'
})
export class MessageBoardComponent {

  channelId: string = '9kacAebjb6GEQZJC7jFL';
  messageService: MessageServiceService = inject(MessageServiceService);
  messages: Message[] = [];

  constructor() {
    this.messageService.getMessagesSortedByTimestampASC(this.channelId).subscribe((messages) => {
      this.messages = messages as Message[];
    });
  }

  isSameDay(timestamp1: number, timestamp2: number): boolean {
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);
    return date1.toDateString() === date2.toDateString();
  }

}
