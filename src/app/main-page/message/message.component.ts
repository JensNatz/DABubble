import { Component, Input, OnInit, Output, EventEmitter, inject, ViewContainerRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarComponent } from '../../shared/avatar/avatar.component';
import { Message } from '../../models/message';
import { UserService } from '../../services/user.service';
import { ReactionIndicatorComponent } from "./reaction-indicator/reaction-indicator.component";
import { MessageService } from '../../services/firebase-services/message.service';
import { EmojiPickerComponent } from '../../shared/emoji-picker/emoji-picker.component';
import { MessageToolbarComponent } from "./message-toolbar/message-toolbar.component";
import { MessageInputComponent } from '../../shared/message-input/message-input.component';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { LoginService } from '../../services/firebase-services/login-service';
import { ChannelServiceService } from '../../services/firebase-services/channel-service.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule,
    AvatarComponent,
    ReactionIndicatorComponent,
    EmojiPickerComponent,
    MessageToolbarComponent,
    ClickOutsideDirective,
    MessageInputComponent,
    ],
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('messageContainer', { read: ViewContainerRef }) container!: ViewContainerRef;
  messageService: MessageService = inject(MessageService);
  channelService: ChannelServiceService = inject(ChannelServiceService);
  loginService: LoginService = inject(LoginService);

  private autorNameSubscription?: Subscription;

  @Input() message!: Message;
  @Input() isThreadRootMessage: boolean = false;
  @Output() repliesClicked = new EventEmitter<string>();
  @Output() messageParseComplete = new EventEmitter<string>();

  authorName: string = 'Unknown User';
  isOwn: boolean = false;
  isEditing: boolean = false;
  displayEmojiPicker: boolean = false;
  avatar: string = '0';
  lastReplyTimestamp: number | null = null;
  isMessageInMainChannel: boolean = false;
  
  emojiPickerPosition: string = 'top: 20px; left: 20px;';
  reactionWithNames: Array<{ type: string; users: Array<{ id: string; name: string }> }> = [];

  constructor(private userService: UserService) { }

  async ngOnInit() {
    this.avatar = await this.userService.getUserAvatar(this.message.author);
    this.reactionWithNames = await this.createReactionDisplayArray(this.message.reactions);
    if (this.message.author === this.loginService.currentUserValue?.id) {
      this.isOwn = true;
    }
    await this.loadAuthorName(this.message.author);
    if (this.message.parentMessageId === null) {
      this.isMessageInMainChannel = true;
    }
  }

  async ngAfterViewInit() {
    await this.renderMessageContent(this.message.content);
    this.messageParseComplete.emit(this.message.id);
    if(this.message.id) {
      this.channelService.messageRendered.next(this.message.id);
    }
  }

  ngOnDestroy() {
    if (this.autorNameSubscription) {
      this.autorNameSubscription.unsubscribe();
    }
  }

  get lastReplyTimeDisplay(): string {
    if (!this.message.lastReplyTimestamp) return '';
    const replyDate = new Date(this.message.lastReplyTimestamp);
    const today = new Date();
    
    if (this.isSameDay(replyDate, today)) {
      return replyDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    } else {
      return replyDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
  }

  get repliesText(): string {
    if (this.message.numberOfReplies) {
      if (this.message.numberOfReplies === 1) {
        return '1 Antwort';
      }
      return `${this.message.numberOfReplies} Antworten`;
    }
    return '';
  }


  showEmojiPicker(event: MouseEvent) {
    this.displayEmojiPicker = true;
  }

  hideEmojiPicker() {
    this.displayEmojiPicker = false;
  }

 
  addReaction(reactionType: string) {
    if (!this.message.id) return;
    let reaction = this.reactionWithNames.find((reaction) => reaction.type === reactionType);

    if (!reaction) {
      reaction = { type: reactionType, users: [] };
      this.reactionWithNames.push(reaction);
    }

    if (!reaction.users.some(user => user.id === this.loginService.currentUserValue?.id)) {
      if (this.loginService.currentUserValue?.id) {
        reaction.users.push({ id: this.loginService.currentUserValue?.id, name: 'Du' });
        this.messageService.addReactionToMessage(this.message.id, reactionType, this.loginService.currentUserValue?.id);
      }
    }
  }

  removeReaction(reactionType: string) {
    if (!this.message.id) return;
    let reaction = this.reactionWithNames.find((reaction) => reaction.type === reactionType);

    if (reaction?.users.some(user => user.id === this.loginService.currentUserValue?.id)) {
      if (this.loginService.currentUserValue?.id) {
        reaction.users = reaction.users.filter(user => user.id !== this.loginService.currentUserValue?.id);
        this.messageService.removeReactionFromMessage(this.message.id, reactionType, this.loginService.currentUserValue?.id);
      }
    }
  }

  async createReactionDisplayArray(reactions: [] | undefined) {
    if (!reactions) return [];
    const entries = Object.entries(reactions);
    return Promise.all(
      entries.map(async reaction => ({
        type: reaction[0],
        users: await Promise.all(
          (reaction[1] as string[]).map(async (userId: string) => ({
            id: userId,
            name: userId === this.loginService.currentUserValue?.id ? 'Du' : (await this.userService.getUserName(userId)) || 'Unknown User'
          }))
        )
      }))
    );
  }

  private async renderMessageContent(content: string) {
    const parsedParts = await this.messageService.parseMessageContent(content);
    this.messageService.renderMessagePartsInContainer(parsedParts, this.container);
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }


  handleReactionToggle(reactionType: string) {
    if (!this.message.id) return;
    let reaction = this.reactionWithNames.find((reaction) => reaction.type === reactionType);
    const hasReaction = reaction?.users.some(user => user.id === this.loginService.currentUserValue?.id) ?? false;

    if (hasReaction) {
      this.removeReaction(reactionType);
    } else {
      this.addReaction(reactionType);
    }
  }

  handleEditMessageClick() {
    this.isEditing = true;
  }

  handleCancelEditClick() {
    this.isEditing = false;
    setTimeout(() => {
      this.renderMessageContent(this.message.content);
    });
  }

  handleSaveEditClick(content: string) {
    if (content.trim() !== '' && this.message.id) {
      if (this.message.content !== content) {
        this.message.content = content;
        this.message.edited = true;
        this.messageService.editMessage(this.message.id, content);

        setTimeout(() => {
           this.renderMessageContent(content);
        });
      } else {
        setTimeout(() => {
          this.renderMessageContent(content);
       });
      }
      this.isEditing = false;
    }
  }

  handleOutsideOfMessageClick() {
    if (this.isEditing) {
      this.isEditing = false;
      setTimeout(() => {
        this.renderMessageContent(this.message.content);
      });
    }
  }

  handleRepliesClick() {
    this.repliesClicked.emit(this.message.id);
  }

  handleAddReplyClick() {
    this.repliesClicked.emit(this.message.id);
  }

  onEmojiOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.hideEmojiPicker();
    }
  }

  handleEmojiSelection(event: any) {
    let emoji = event.emoji.id;
    this.addReaction(emoji);
    this.hideEmojiPicker();
  }

  private async loadAuthorName(userId: string) {
    if (this.isOwn) {
      this.autorNameSubscription = this.loginService.currentUser.subscribe(user => {
        if (user) {
          this.authorName = user.name;
        } else {
          this.authorName = 'Unknown User';
        }
      })
    } else {
      this.authorName = (await this.userService.getUserName(userId)) || 'Unknown User';
    }
  }
}


