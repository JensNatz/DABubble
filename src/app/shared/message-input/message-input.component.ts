import { Component, Input, Output, EventEmitter, inject, ViewChild, ViewContainerRef, AfterViewInit, OnDestroy, ComponentRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from '../../services/firebase-services/message.service';
import { FormsModule } from '@angular/forms';
import { EmojiPickerComponent } from '../emoji-picker/emoji-picker.component';
import { TagSelectionListComponent } from '../tag-selection-list/tag-selection-list.component';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { MentionComponent } from '../mention/mention.component';
import { MessagePart } from '../../models/message-part';
import { ChannelServiceService } from '../../services/firebase-services/channel-service.service';
import { ButtonComponent } from '../button/button.component';
@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [FormsModule, CommonModule, EmojiPickerComponent, TagSelectionListComponent, ClickOutsideDirective, MentionComponent, ButtonComponent],
  templateUrl: './message-input.component.html',
  styleUrl: './message-input.component.scss'
})
export class MessageInputComponent implements AfterViewInit {
  messageService: MessageService = inject(MessageService);
  channelService: ChannelServiceService = inject(ChannelServiceService);

  @ViewChild('messageInput', { read: ViewContainerRef }) messageInput!: ViewContainerRef;

  isEmojiPickerOpen: boolean = false;
  isInputEnabled: boolean = true;
  isPlaceholderVisible: boolean = true;
  isTaggingDisabled: boolean = false;
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
    if (this.messageInput) {
      this.focusOnInput();
    }
  }

  ngOnChanges() {
    if (this.channelService.currentChannelValue === null) {
      this.isTaggingDisabled = true;
    } else {
      this.isTaggingDisabled = false;
      this.focusOnInput();
    }
  }

  async ngAfterViewInit() {
    this.focusOnInput();

    if (this.content !== '') {
      this.mentionsCache = [];
      this.mentionCounter = 0;
      const parsedParts = await this.messageService.parseMessageContent(this.content);
      const renderedComponents = this.messageService.renderMessagePartsInContainer(parsedParts, this.messageInput);
      this.fillMentionsCacheBasedOnMessageInput(renderedComponents);
      this.togglePlaceholder();
    }
  }

  get isSendButtonDisabled(): boolean {
    if (this.channelService.currentChannelValue === null) {
      return true;
    }
    const inputElement = this.messageInput?.element.nativeElement;
    if (inputElement) {
      const hasText = !!inputElement.textContent?.trim();
      const hasMentions = inputElement.getElementsByTagName('app-mention').length > 0;
      return hasText || hasMentions ? false : true;
    }
    return true;
  }

  fillMentionsCacheBasedOnMessageInput(renderedComponents: Array<{ component: any, part: MessagePart }>) {
    renderedComponents.forEach(({ part }) => {
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

  private updateLastRange() {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      this.lastRange = selection.getRangeAt(0);
    }
  }

  onInputChange() {
    this.togglePlaceholder();
    this.updateLastRange();
  }

  onInputClick() {
    this.updateLastRange();
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const text = event.clipboardData?.getData('text/plain');
    document.execCommand('insertText', false, text);
    this.updateLastRange();
}

  togglePlaceholder() {
    const inputElement = this.messageInput?.element.nativeElement;
    if (inputElement.innerHTML === '') {
      this.isPlaceholderVisible = true;
    } else {
      this.isPlaceholderVisible = false;
    }
  }

  focusOnInput() {
    const inputElement = this.messageInput?.element.nativeElement;
    if (inputElement) {
      inputElement.focus();
      const range = document.createRange();
      range.selectNodeContents(inputElement);
      range.collapse(false);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
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
    if (!this.messageInput) return;

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
    this.togglePlaceholder();
    this.isEmojiPickerOpen = false;
    this.lastRange = null;
  }


  private addTagToInput(id: string, name: string, type: 'user' | 'channel') {
    if (!this.messageInput) return;

    const componentRef = this.createMentionComponent(id, name, type);
    this.insertMentionIntoInput(componentRef);
    this.mentionCounter++;
    this.updateMentionsCache(id, name, type);
    this.togglePlaceholder();
  }

  private createMentionComponent(id: string, name: string, type: 'user' | 'channel') {
    const componentRef = this.messageInput.createComponent(MentionComponent);
    componentRef.setInput('type', type);
    componentRef.setInput('id', id);
    componentRef.setInput('displayName', name);
    componentRef.setInput('isClickable', false);
    componentRef.location.nativeElement.id = `mentionid${this.mentionCounter}`;
    componentRef.location.nativeElement.contentEditable = false;
    return componentRef;
  } 

  private insertMentionIntoInput(componentRef: ComponentRef<MentionComponent>) {
    const inputElement = this.messageInput.element.nativeElement;
    let range: Range;

    if (this.lastRange && inputElement.contains(this.lastRange.commonAncestorContainer)) {
      this.lastRange.insertNode(componentRef.location.nativeElement);
      range = this.lastRange;
    } else {
      inputElement.appendChild(componentRef.location.nativeElement);
      range = document.createRange();
    }

    range.setStartAfter(componentRef.location.nativeElement);
    range.collapse(true);
    
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    this.updateLastRange();
  }

  private updateMentionsCache(id: string, name: string, type: 'user' | 'channel') {
    this.mentionsCache.push({ type, content: name, id });
  }

  onTagSelected(tag: { id: string; name: string; type: 'user' | 'channel' }) {
    if (tag.type === 'user') {
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
    if (this.channelService.currentChannelValue === null) {
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      if (!this.isSendButtonDisabled) {
        this.emitMessageToParent();
      }
    }
    if (event.key === '@') {
      event.preventDefault();
      this.taglistType = 'user';
      this.isTagSelectionListOpen = true;
    }
    if (event.key === '#') {
      event.preventDefault();
      this.taglistType = 'channel';
      this.isTagSelectionListOpen = true;
    }
  }
}

