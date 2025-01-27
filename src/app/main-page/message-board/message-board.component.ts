import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeSeperatorComponent } from '../time-seperator/time-seperator.component';
import { MessageComponent } from '../message/message.component';
import { Message } from '../../models/message';
import { MessageInputComponent } from '../../shared/message-input/message-input.component';
import { MessageService } from '../../services/firebase-services/message.service';
import { Channel } from '../../models/channel';
import { ChannelServiceService } from '../../services/firebase-services/channel-service.service';
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
  
  // TODO: get userId from auth service
  userId: string = 'YAJxDG5vwYHoCbYjwFhb';
  //todo: this needs to be input from parent component
  channel: Channel | null = null;
  messageService: MessageService = inject(MessageService);
  messages: Message[] = [];
  threadMessages: Message[] = [];
  isThreadOpen: boolean = false;
  parentMessageId: string = '';
  constructor() {
    this.channel = inject(ChannelServiceService).currentChannel;
    if (this.channel && this.channel.id) {
      this.messageService.getMessagesFromChannelOrderByTimestampDESC(this.channel.id).subscribe((messages) => {
        this.messages = messages as Message[];
      });
    }
  }

  isSameDay(timestamp1: number, timestamp2: number): boolean {
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);
    return date1.toDateString() === date2.toDateString();
  }

  openTheadWithMessageId(messageId: string) {
    this.messageService.getRepliesFromMessageOrderByTimestampDESC(messageId).subscribe((messages) => {
      this.threadMessages = messages as Message[];
    });
    this.isThreadOpen = true;
  }

  closeThread() {
    this.isThreadOpen = false;
  }

  onSendMessage(content: string) {
    if (content.trim() === '') {
      return;
    }
    if (!this.channel || !this.channel.id) {
      return;
    }
    let message: Message = {
      content: content,
      timestamp: Date.now(),
      author: this.userId,
      channelId: this.channel.id,
      edited: false,
      parentMessageId: null
    };

    this.messageService.postMessageToChannel(this.channel.id, message);
  }

  onSendReply(content: string) {
    if (content.trim() === '') {
      return;
    }

    if (!this.channel || !this.channel.id) {
      return;
    }
    let message: Message = {
      content: content,
      timestamp: Date.now(),
      author: this.userId,
      channelId: this.channel.id,
      edited: false,
      parentMessageId: this.parentMessageId
    };

   this.messageService.postReplyToMessage(this.channel.id, this.parentMessageId, message);
  }

  handleRepliesClick(messageId: string) {
    this.parentMessageId = messageId;
    this.openTheadWithMessageId(messageId);
  }

}
