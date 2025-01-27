import { Component, Input, OnInit, Output, EventEmitter, inject, ViewContainerRef, ViewChild, AfterViewInit } from '@angular/core';
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
import { MentionComponent } from './mention/mention.component';
import { MessagePart } from '../../models/message-part';

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
    MentionComponent],
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit, AfterViewInit {
  @ViewChild('messageContainer', { read: ViewContainerRef }) container!: ViewContainerRef;
  messageService: MessageService = inject(MessageService);
  @Input() message!: Message;
  @Output() repliesClicked = new EventEmitter<string>();


  messageContentParsed: string = '';
  authorName: string = 'Unknown User';
  isOwn: boolean = false;
  isEditing: boolean = false;
  displayEmojiPicker: boolean = false;
  // TODO: get user id from auth service
  userId: string = 'YAJxDG5vwYHoCbYjwFhb';
  // TODO: get channel id from ???
  channelId: string = '9kacAebjb6GEQZJC7jFL';
  avatarId: string = '0';
  lastReplyTimestamp: number | null = null;
  isMessageInMainChannel: boolean = false;
  emojiPickerPosition: string = 'top: 50px; left: 50px;';
  reactionWithNames: Array<{ type: string; users: Array<{ id: string; name: string }> }> = [];

  constructor(private userService: UserService) { }

  async ngOnInit() {
    this.authorName = await this.userService.getUserName(this.message.author);
    this.avatarId = await this.userService.getUserAvatar(this.message.author);
    this.reactionWithNames = await this.createReactionDisplayArray(this.message.reactions);
    this.messageContentParsed = this.message.content;
    if (this.message.author === this.userId) {
      this.isOwn = true;
    }
    if (this.message.parentMessageId === null) {
      this.isMessageInMainChannel = true;
    }
  }

  async ngAfterViewInit() {
    const parsedParts = await this.messageService.parseMessageContent(this.message.content);
    this.renderParts(parsedParts);
  }

  private renderParts(parts: MessagePart[]) {
    this.container.clear();
    parts.forEach(part => {
      if (part.type === 'text') {
        const span = document.createElement('span');
        span.textContent = part.content || '';
        this.container.element.nativeElement.appendChild(span);
      } else {
        const componentRef = this.container.createComponent(MentionComponent);
        componentRef.setInput('type', part.type);
        componentRef.setInput('id', part.id);
        componentRef.setInput('displayName', part.displayName);
        this.container.element.nativeElement.appendChild(componentRef.location.nativeElement);
      }
    });
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

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }

  private calcPickerPosition(event: MouseEvent): string {
    const buffer = 20;
    const viewportHeight = window.innerHeight - buffer;
    const viewportWidth = window.innerWidth - buffer;
    const pickerHeight = 339;
    const pickerWidth = 426;

    let position = '';

    if (event.clientY + pickerHeight > viewportHeight) {
      position += `bottom: ${buffer}px; `;
    } else {
      position += `top: ${Math.max(buffer, event.clientY)}px; `;
    }

    if (event.clientX + pickerWidth > viewportWidth) {
      position += `right: ${buffer}px;`;
    } else {
      position += `left: ${Math.max(buffer, event.clientX)}px;`;
    }
    return position;
  }

  showEmojiPicker(event: MouseEvent) {
    this.displayEmojiPicker = true;
    this.emojiPickerPosition = this.calcPickerPosition(event);
  }

  hideEmojiPicker() {
    this.displayEmojiPicker = false;
  }

  handleEmojiSelection(event: any) {
    let emoji = event.emoji.id;
    this.addReaction(emoji);
    this.hideEmojiPicker();
  }

  onEmojiOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.hideEmojiPicker();
    }
  }

  addReaction(reactionType: string) {
    if (!this.message.id) return;
    let reaction = this.reactionWithNames.find((reaction) => reaction.type === reactionType);

    if (!reaction) {
      reaction = { type: reactionType, users: [] };
      this.reactionWithNames.push(reaction);
    }

    if (!reaction.users.some(user => user.id === this.userId)) {
      reaction.users.push({ id: this.userId, name: 'Du' });
      this.messageService.addReactionToMessage(this.message.id, reactionType, this.userId);
    }
  }

  removeReaction(reactionType: string) {
    if (!this.message.id) return;
    let reaction = this.reactionWithNames.find((reaction) => reaction.type === reactionType);

    if (reaction?.users.some(user => user.id === this.userId)) {
      reaction.users = reaction.users.filter(user => user.id !== this.userId);
      this.messageService.removeReactionFromMessage(this.message.id, reactionType, this.userId);
    }
  }

  handleReactionToggle(reactionType: string) {
    if (!this.message.id) return;
    let reaction = this.reactionWithNames.find((reaction) => reaction.type === reactionType);
    const hasReaction = reaction?.users.some(user => user.id === this.userId) ?? false;

    if (hasReaction) {
      this.removeReaction(reactionType);
    } else {
      this.addReaction(reactionType);
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
            name: userId === this.userId ? 'Du' : await this.userService.getUserName(userId)
          }))
        )
      }))
    );
  }

  handleEditMessageClick() {
    this.isEditing = true;
  }

  handleCancelEditClick() {
    this.isEditing = false;
  }

  handleSaveEditClick(content: string) {
    if (content.trim() !== '' && this.message.id) {
      if (this.message.content !== content) {
        this.message.content = content;
        this.message.edited = true;
        this.messageService.editMessage(this.message.id, content);
      }
      this.isEditing = false;
    }
  }

  handleOutsideOfMessageClick() {
     this.isEditing = false;
  }

  handleRepliesClick() {
    this.repliesClicked.emit(this.message.id);
  }

  handleAddReplyClick() {
    this.repliesClicked.emit(this.message.id);
  }
}
