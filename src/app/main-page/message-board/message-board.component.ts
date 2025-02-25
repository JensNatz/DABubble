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
import { ChannelEditComponent } from '../../shared/channel-edit/channel-edit.component';
import { RecipientSelectorComponent } from '../../shared/recipient-selector/recipient-selector.component';
import { AnswersSeperatorComponent } from './answers-seperator/answers-seperator.component';
import { ModalService } from './../../services/modal.service';

@Component({
  selector: 'app-message-board',
  standalone: true,
  imports: [
    CommonModule,
    MessageComponent,
    TimeSeperatorComponent,
    MessageInputComponent,
    AvatarComponent,
    LoadingIndicatorComponent,
    ChannelEditComponent,
    RecipientSelectorComponent,
    AnswersSeperatorComponent,
    RecipientSelectorComponent,
],

  templateUrl: './message-board.component.html',
  styleUrl: './message-board.component.scss'
})
export class MessageBoardComponent {

  channelId: string = '';
  channelName: string = '';
  channelCreator: any = '';
  userAvatar = '';
  userOnlineStatus = '';
  channelType: string = '';
  channelDescription: string = '';
  directMessagePartnerName: string = '';
  channelMembers: string[] = [];
  channelsData: any[] = [];
  channelsDataLength: number = 0;
  channels: any[] = [];

  messageService: MessageService = inject(MessageService);
  channelService: ChannelServiceService = inject(ChannelServiceService);
  userService: UserServiceService = inject(UserServiceService);
  loginService: LoginService = inject(LoginService);
  modalService: ModalService = inject(ModalService);

  messages: Message[] = [];
  threadMessages: Message[] = [];
  isThreadOpen: boolean = false;
  parentMessageId: string = '';
  allMessagesLoaded: boolean = false;
  
  private parsedMainMessagesId =new Set<string>();
  private parsedThreadMessagesId = new Set<string>();
  private channelSubscription: Subscription = new Subscription();
  private userSubscription: Subscription = new Subscription();
  private loadUserSubscription: Subscription = new Subscription();

  private subscription: Subscription = new Subscription();

  constructor() {
    this.subscription.add(
      this.modalService.channelName$.subscribe(newName => {
        this.channelName = newName;
      })
    );

    this.subscription.add(
      this.modalService.channelDescription$.subscribe(newDescription => {
        this.channelDescription = newDescription;
      })
    );

    this.subscription.add(
      this.channelService.threadOpenState$.subscribe(state => {
        this.isThreadOpen = state;
        console.log('thread open state:', state);
      })
    );
  }
  
  ngOnInit() {
    this.channelSubscription = this.channelService.currentChannel$.subscribe(async channel => {
      if (channel?.id) {
        if (this.channelId !== channel.id) {
          this.channelId = channel.id;
          this.channelName = channel.name;
          this.channelType = channel.type;
          this.channelDescription = channel.description;
          this.channelCreator = channel.creator;
          this.channelMembers = channel.members || [];
          this.loadMessages();
          this.modalService.refreshChannelUsers$.subscribe(() => {
            this.getUserFromChannel();
          });
          this.getUserFromChannel();

          if (this.channelType === 'direct' && channel.members) {
            this.setDirectMessagePartnerData(channel.members);
          }
        }
      } else {
        this.clearMessageBoardData();
      }
    });
  }

  updateChannelName(newName: string) {
    this.channelName = newName;
  }

  updateChannelDescription(newDescription: string) {
    this.channelDescription = newDescription;
  }

  ngOnDestroy() {
    this.channelSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
    this.loadUserSubscription.unsubscribe();
    this.subscription.unsubscribe();
  }

  get headerTitle() {
    if (this.channelType === 'direct') {
      return this.directMessagePartnerName;
    } else if (this.channelType === 'group') {
      return this.channelName;
    } else {
      return 'Neue Nachricht';
    }
  }

  get placeholder() {
    if (this.channelType === 'direct') {
      return 'Nachricht an ' + this.directMessagePartnerName;
    } else if (this.channelType === 'group') {
      return 'Nachricht an ' + this.channelName;
    } else {
      return 'Wähle einen Empfänger und starte eine neue Nachricht...';
    }
  }

  async getUserFromChannel() {
    this.channelsData = await this.channelService.getMembersOfChannelWithDetails(this.channelId); 
    this.channelsDataLength = this.channelsData.length;   
  }
  
  setDirectMessagePartnerData(members: string[]) {
    const currentUser = this.loginService.currentUserValue;
    const otherUserId = members.find(member => member !== currentUser?.id);
  
    if (otherUserId) {
      this.userSubscription.unsubscribe();
      this.userSubscription = this.userService.getUserById(otherUserId).subscribe((user: User) => {
        this.userAvatar = user.avatar;
        this.userOnlineStatus = user.onlineStatusbar;
        this.directMessagePartnerName = user.name;
      });
    } else if (currentUser) {
      this.userAvatar = currentUser.avatar;
      this.userOnlineStatus = currentUser.onlineStatusbar;
      this.directMessagePartnerName = currentUser.name + ' (Du)';
    }
  }

  clearMessageBoardData() {
    this.channelId = '';
    this.channelName = '';
    this.channelType = '';
    this.channelDescription = '';
    this.channelMembers = [];
    this.messages = [];
    this.directMessagePartnerName = '';
    this.userAvatar = '';
    this.channelService.setThreadOpenState(false);
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

  handleMainMessageParsed(messageId: string) {
    this.parsedMainMessagesId.add(messageId);
  }
  
  handleThreadMessageParsed(messageId: string) {
    this.parsedThreadMessagesId.add(messageId);
  }
  
  areAllMainMessagesParsed(): boolean {
    return this.messages.every(message => message.id && this.parsedMainMessagesId.has(message.id));
  }

  areAllThreadMessagesParsed(): boolean {
    return this.threadMessages.every(message => message.id && this.parsedThreadMessagesId.has(message.id));
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
    this.channelService.setThreadOpenState(true);
  }

  closeThread() {
    this.channelService.setThreadOpenState(false);
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

  getParentMessage(): Message | undefined {
    if (this.parentMessageId) {
      return this.messages.find(message => message.id === this.parentMessageId);
    }
    return undefined;
  }

  openEditChannel() {
    this.modalService.openModal('editChannel');
  }

  openAddUserToChannel() {
    this.modalService.openModal('addUserToChannel');
  }
  
  openUserAddInfos() {
    this.modalService.openModal('userAdd');
  }
}
