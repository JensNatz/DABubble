import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeSeperatorComponent } from '../time-seperator/time-seperator.component';
import { MessageComponent } from '../message/message.component';
import { Message } from '../../models/message';
import { MessageInputComponent } from '../../shared/message-input/message-input.component';
import { MessageService } from '../../services/firebase-services/message.service';

@Component({
  selector: 'app-message-board',
  standalone: true,
  imports: [
    CommonModule,
    MessageComponent,
    TimeSeperatorComponent,
    MessageInputComponent,
  ],
  templateUrl: './message-board.component.html',
  styleUrl: './message-board.component.scss'
})
export class MessageBoardComponent {

  // TODO: get channelId from parent component
  channelId: string = '9kacAebjb6GEQZJC7jFL';
  // TODO: get userId from auth service
  userId: string = 'YAJxDG5vwYHoCbYjwFhb';
  messageService: MessageService = inject(MessageService);
  messages: Message[] = [];
  threadMessages: Message[] = [];
  isThreadOpen: boolean = false;

  constructor() {
    this.messageService.getMessagesFromChannelOrderByTimestampDESC(this.channelId).subscribe((messages) => {
      this.messages = messages as Message[];
    });
  }

  isSameDay(timestamp1: number, timestamp2: number): boolean {
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);
    return date1.toDateString() === date2.toDateString();
  }

  openTheadWithMessageId(messageId: string) {
    this.messageService.getRepliesFromMessageOrderByTimestampDESC(messageId).subscribe((messages) => {
      this.threadMessages = messages as Message[];
      console.log(this.threadMessages, 'thread öffnen im board');
    });
    this.isThreadOpen = true;

    
  }

  onSendMessage(content: string) {
    if (content.trim() === '') {
      return;
    }
    let message: Message = {
      content: content,
      timestamp: Date.now(),
      author: this.userId,
      channelId: this.channelId,
      edited: false
    };

    this.messageService.postMessageToChannel(this.channelId, message);
  
    console.log(message);
  }

  handleRepliesClick(messageId: string) {
    this.openTheadWithMessageId(messageId);
  }

}
