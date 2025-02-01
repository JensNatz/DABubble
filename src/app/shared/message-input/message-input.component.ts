import { Component, Input, Output, EventEmitter, inject, ViewChild, ViewContainerRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from '../../services/firebase-services/message.service';
import { FormsModule } from '@angular/forms';
import { EmojiPickerComponent } from '../emoji-picker/emoji-picker.component';
import { TagSelectionListComponent } from '../tag-selection-list/tag-selection-list.component';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { MentionComponent } from '../mention/mention.component';
import { MessagePart } from '../../models/message-part';
import { Subscription } from 'rxjs';
import { ChannelServiceService } from '../../services/firebase-services/channel-service.service';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [FormsModule, CommonModule, EmojiPickerComponent, TagSelectionListComponent, ClickOutsideDirective, MentionComponent],
  templateUrl: './message-input.component.html',
  styleUrl: './message-input.component.scss'
})
export class MessageInputComponent implements AfterViewInit, OnDestroy {
  messageService: MessageService = inject(MessageService);
  channelService: ChannelServiceService = inject(ChannelServiceService);
  private channelSubscription: Subscription;

  @ViewChild('messageInput', { read: ViewContainerRef }) messageInput!: ViewContainerRef;

  isEmojiPickerOpen: boolean = false;
  isSubmittingDisabled: boolean = true;
  isTagSelectionListOpen: boolean = false;
  taglistType: 'user' | 'channel' = 'user';
  private mentionCounter: number = 0;
  private mentionsCache: Array<{ type: 'user' | 'channel', content: string, id: string }> = [];
  private lastRange: Range | null = null;

  @Input() placeholder: string | null = null;
  @Input() content: string = '';
  @Input() type: string = '';
  @Output() sendMessage = new EventEmitter<string>();
  @Output() cancelEdit = new EventEmitter<void>();
  @Output() saveEdit = new EventEmitter<string>();

  constructor() {
    this.channelSubscription = this.channelService.currentChannel$.subscribe(() => {
      if (this.messageInput) {
        const inputElement = this.messageInput.element.nativeElement;
        inputElement.innerHTML='';
        inputElement.focus();
      }
    });
  }

  ngOnDestroy() {
    if (this.channelSubscription) {
      this.channelSubscription.unsubscribe();
    }
  }

  async ngAfterViewInit() {
    const inputElement = this.messageInput.element.nativeElement;
    inputElement.focus();
    if (this.content !== '') {
      this.mentionsCache = [];
      this.mentionCounter = 0;
      const parsedParts = await this.messageService.parseMessageContent(this.content);
      const renderedComponents = this.messageService.renderMessagePartsInContainer(parsedParts, this.messageInput);
      this.fillMentionsCacheBasedOnMessageInput(renderedComponents);
      this.updateButtonStateBasedOnInput();
    }
  }

  fillMentionsCacheBasedOnMessageInput(renderedComponents: Array<{component: any, part: MessagePart}>) {
    renderedComponents.forEach(({part}) => {
      if (part.type === 'user' || part.type === 'channel') {
        this.mentionsCache.push({
          type: part.type,
          content: part.displayName || '',
          id: part.id || ''
        });
        this.mentionCounter++;
      }
    });
  }

  onInputChange() {
    this.updateButtonStateBasedOnInput(); 
  }

  updateButtonStateBasedOnInput() {
    const inputElement = this.messageInput?.element.nativeElement;
    if (inputElement) {
      const hasText = !!inputElement.textContent?.trim();
      const hasMentions = inputElement.getElementsByTagName('app-mention').length > 0;
      this.isSubmittingDisabled = !hasText && !hasMentions;
    }
  }

  onCancelEditClick() {
    this.cancelEdit.emit();
  }

  onSaveEditClick() {
    this.emitMessageToParent();
  }

  onEmojiButtonClick() {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      this.lastRange = selection.getRangeAt(0);
    }
    this.isEmojiPickerOpen = !this.isEmojiPickerOpen;
  }

  onEmojiOverlayClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.isEmojiPickerOpen = false;
    }
  }

  onEmojiSelected(event: { emoji: { native: string } }) {
    if (this.messageInput) {
      const inputElement = this.messageInput.element.nativeElement;
      const emojiText = document.createTextNode(` ${event.emoji.native} `);
      
      if (this.lastRange && inputElement.contains(this.lastRange.commonAncestorContainer)) {
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(this.lastRange);
        this.lastRange.insertNode(emojiText);
        this.lastRange.setStartAfter(emojiText);
        this.lastRange.collapse(true);
      } else {
        inputElement.appendChild(emojiText);
      }
      
      this.updateButtonStateBasedOnInput();
    }
    this.isEmojiPickerOpen = false;
    this.lastRange = null;
  }

  private addTagToInput(id: string, name: string, type: 'user' | 'channel') {
    if (this.messageInput) {
      const componentRef = this.messageInput.createComponent(MentionComponent);
      componentRef.setInput('type', type);
      componentRef.setInput('id', id);
      componentRef.setInput('displayName', name);
      componentRef.location.nativeElement.id = `mentionid${this.mentionCounter}`;
      this.mentionCounter++;
      componentRef.location.nativeElement.contentEditable = false;

      if (this.lastRange && this.messageInput.element.nativeElement.contains(this.lastRange.commonAncestorContainer)) {
        this.lastRange.insertNode(componentRef.location.nativeElement);
        this.lastRange.setStartAfter(componentRef.location.nativeElement);
        this.lastRange.collapse(true);
      } else {
        this.messageInput.element.nativeElement.appendChild(componentRef.location.nativeElement);
      }

      this.mentionsCache.push({ type, content: name, id });
      this.updateButtonStateBasedOnInput();
    }
  }

  onTagSelected(tag: { id: string; name: string; type: 'user' | 'channel' }) {
    if(tag.type === 'user') {
      this.addUserTagToInput(tag.id, tag.name);
    } else {
      this.addChannelTagToInput(tag.id, tag.name);
    }
    this.isTagSelectionListOpen = false;
  }

  addUserTagToInput(userId: string, name: string) {
    this.addTagToInput(userId, name, 'user');
  }

  addChannelTagToInput(channelId: string, name: string) {
    this.addTagToInput(channelId, name, 'channel');
  }

  onSendClick() {
    this.emitMessageToParent();
  }

  private emitMessageToParent() {
    const inputElement = this.messageInput?.element.nativeElement;
    if (inputElement) {
      const parsedMessage = this.parseMessageFromContentPartsForDatabase();
      if (parsedMessage !== '') {
        this.sendMessage.emit(parsedMessage);
        this.resetInputField();
      }
    }
  }

  private resetInputField() {
    const inputElement = this.messageInput?.element.nativeElement;
    if (inputElement) {
      inputElement.innerHTML = '';
      this.mentionsCache = [];
      this.mentionCounter = 0;
      this.updateButtonStateBasedOnInput();
    }
  }

  private parseMessageFromContentPartsForDatabase() {
    const inputElement = this.messageInput?.element.nativeElement;
    if (!inputElement) return '';
    return Array.from<Node>(inputElement.childNodes)
      .map((part: Node) => {
        if (part.nodeType === Node.TEXT_NODE) {
          return part.textContent?.trim() || '';
        }     
        if (part.nodeType === Node.ELEMENT_NODE && (part as HTMLElement).id.startsWith('mentionid')) {
          const mentionIndex = parseInt((part as HTMLElement).id.replace('mentionid', ''));
          const mention = this.mentionsCache[mentionIndex];
          if (mention) {
            return `${mention.type === 'user' ? '@' : '#'}{[${mention.id}]}`;
          }
        }      
        return '';
      })
      .join('');
  }

  onTagUserIconClick() {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      this.lastRange = selection.getRangeAt(0);
    }
    this.taglistType = 'user';
    this.isTagSelectionListOpen = !this.isTagSelectionListOpen;
  }

  onTagListClickOutside() {
    this.isTagSelectionListOpen = false;
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      if(!this.isSubmittingDisabled) {
        this.emitMessageToParent();
      }
    }
    if(event.key === '@') {
      event.preventDefault();
      this.taglistType = 'user';
      this.isTagSelectionListOpen = true;
    }
    if(event.key === '#') {
      event.preventDefault();
      this.taglistType = 'channel';
      this.isTagSelectionListOpen = true;
    }
  }
}

