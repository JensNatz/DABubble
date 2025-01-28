import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeSeperatorComponent } from '../time-seperator/time-seperator.component';
import { MessageComponent } from '../message/message.component';
import { Message } from '../../models/message';
import { MessageInputComponent } from '../../shared/message-input/message-input.component';
import { MessageService } from '../../services/firebase-services/message.service';
import { ActivatedRoute } from '@angular/router';
import { ChannelServiceService } from '../../services/firebase-services/channel-service.service';
import { firstValueFrom } from 'rxjs';
import { UserServiceService } from '../../services/firebase-services/user-service.service';
import { User } from '../../models/user';

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

  channelId: string = '';
  channelName: string = '';
  userAvatar = '';

  // TODO: get userId from auth service
  userId: string = 'YAJxDG5vwYHoCbYjwFhb';

  messageService: MessageService = inject(MessageService);
  channelService: ChannelServiceService = inject(ChannelServiceService);
  userService: UserServiceService = inject(UserServiceService);

  messages: Message[] = [];
  threadMessages: Message[] = [];
  isThreadOpen: boolean = false;
  parentMessageId: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['channelId']) {
        this.channelId = params['channelId'];
        this.loadChannelDetails();
        this.loadMessages();
      }

      if (params['userId']) {
        this.channelId = params['userId'];
        this.loadUserName();
        this.loadMessages();
      }
    });
  }

  loadUserName() {
    this.userService.getUserById(this.channelId).subscribe((user: User) => {
      this.channelName = user.name;
      this.userAvatar = user.avatar;
    });
  }

  loadChannelDetails() {
    if (this.channelId) {
      firstValueFrom(this.channelService.getChannelById(this.channelId)).then((channel) => {
        this.channelName = channel.name;
      });
    }
  }

  loadMessages() {
    if (this.channelId) {
      this.messageService.getMessagesFromChannelOrderByTimestampDESC(this.channelId).subscribe((messages) => {
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
    let message: Message = {
      content: content,
      timestamp: Date.now(),
      author: this.userId,
      channelId: this.channelId,
      edited: false,
    };

    this.messageService.postMessageToChannel(this.channelId, message);
  }

  onSendReply(content: string) {
    if (content.trim() === '') {
      return;
    }
    let message: Message = {
      content: content,
      timestamp: Date.now(),
      author: this.userId,
      channelId: this.channelId,
      edited: false,
      parentMessageId: this.parentMessageId
    };

   this.messageService.postReplyToMessage(this.channelId, this.parentMessageId, message);
  }

  handleRepliesClick(messageId: string) {
    this.parentMessageId = messageId;
    this.openTheadWithMessageId(messageId);
  }

}
