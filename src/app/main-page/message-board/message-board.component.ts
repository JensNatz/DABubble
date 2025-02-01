import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeSeperatorComponent } from '../time-seperator/time-seperator.component';
import { MessageComponent } from '../message/message.component';
import { Message } from '../../models/message';
import { MessageInputComponent } from '../../shared/message-input/message-input.component';
import { MessageService } from '../../services/firebase-services/message.service';
import { ChannelServiceService } from '../../services/firebase-services/channel-service.service';
import { UserServiceService } from '../../services/firebase-services/user-service.service';
import { User } from '../../models/user';
import { AvatarComponent } from '../../shared/avatar/avatar.component';
import { LoginService } from '../../services/firebase-services/login-service';
import { Subscription } from 'rxjs';
import { LoadingIndicatorComponent } from '../../shared/loading-indicator/loading-indicator.component';
@Component({
  selector: 'app-message-board',
  standalone: true,
  imports: [
    CommonModule,
    MessageComponent,
    TimeSeperatorComponent,
    MessageInputComponent,
    AvatarComponent,
    LoadingIndicatorComponent
  ],
  templateUrl: './message-board.component.html',
  styleUrl: './message-board.component.scss'
})
export class MessageBoardComponent {

  channelId: string = '';
  channelName: string = '';
  userAvatar = '';
  channelType: string = '';
  channelDescription: string = '';
  directMessagePartnerName: string = '';

  messageService: MessageService = inject(MessageService);
  channelService: ChannelServiceService = inject(ChannelServiceService);
  userService: UserServiceService = inject(UserServiceService);
  loginService: LoginService = inject(LoginService);

  messages: Message[] = [];
  threadMessages: Message[] = [];
  isThreadOpen: boolean = false;
  parentMessageId: string = '';
  allMessagesLoaded: boolean = false;
  private parsedMessagesId =new Set<string>();

  private channelSubscription: Subscription = new Subscription();
  private userSubscription: Subscription = new Subscription();
  private loadUserSubscription: Subscription = new Subscription();

  ngOnInit() {
    this.channelSubscription = this.channelService.currentChannel$.subscribe(async channel => {
      if (channel?.id) {
        this.channelId = channel.id;
        this.channelName = channel.name;
        this.channelType = channel.type;
        this.channelDescription = channel.description;
        await this.loadMessages();
        this.isThreadOpen = false;
        if (this.channelType === 'direct' && channel.members) {
          this.setDirectMessagePartnerData(channel.members);
        }
      }
    });
  }

  ngOnDestroy() {
    this.channelSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
    this.loadUserSubscription.unsubscribe();
  }

  get channelTitle() {
    if (this.channelType === 'direct') {
      return 'Direktnachricht an ' + this.directMessagePartnerName;
    } else {
      return '#' + this.channelName;
    }
  }

  setDirectMessagePartnerData(members: string[]) {
    const otherUserId = members.find(member => member !== this.loginService.currentUserValue?.id);
    if (otherUserId) {
      this.userSubscription.unsubscribe();
      this.userSubscription = this.userService.getUserById(otherUserId).subscribe((user: User) => {
        this.userAvatar = user.avatar;
        this.directMessagePartnerName = user.name;
      });
    } else {
      alert('Das ist eine Nachricht an den eingeloggten Account');
    }
  }

  loadUserName() {
    this.loadUserSubscription.unsubscribe();
    this.loadUserSubscription = this.userService.getUserById(this.channelId).subscribe((user: User) => {
      this.channelName = user.name;
      this.userAvatar = user.avatar;
    });
  }

  loadMessages() {
    if (this.channelId) {
      this.messageService.getMessagesFromChannelOrderByTimestampDESC(this.channelId).subscribe((messages) => {
        this.messages = messages as Message[];
      });
    }
  }

  handleMessageParsed(messageId: string) {
    this.parsedMessagesId.add(messageId);
  }
  
  areAllMessagesParsed(): boolean {
    return this.messages.every(message => message.id && this.parsedMessagesId.has(message.id));
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
    if (!this.channelId || !this.loginService.currentUserValue?.id) {
      return;
    }
    let message: Message = {
      content: content,
      timestamp: Date.now(),
      author: this.loginService.currentUserValue.id,
      channelId: this.channelId,
      edited: false,
      parentMessageId: null
    };
    this.messageService.postMessageToChannel(this.channelId, message);
  }

  onSendReply(content: string) {
    if (content.trim() === '') {
      return;
    }

    if (!this.channelId || !this.loginService.currentUserValue?.id) {
      return;
    }
    let message: Message = {
      content: content,
      timestamp: Date.now(),
      author: this.loginService.currentUserValue?.id,
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
