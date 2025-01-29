import { Component, Input, Output, EventEmitter, inject, ViewChild, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from '../../services/firebase-services/message.service';
import { FormsModule } from '@angular/forms';
import { EmojiPickerComponent } from '../emoji-picker/emoji-picker.component';
import { TagSelectionListComponent } from '../tag-selection-list/tag-selection-list.component';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { MentionComponent } from '../mention/mention.component';


@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [FormsModule, CommonModule, EmojiPickerComponent, TagSelectionListComponent, ClickOutsideDirective, MentionComponent],
  templateUrl: './message-input.component.html',
  styleUrl: './message-input.component.scss'
})
export class MessageInputComponent {
  messageService: MessageService = inject(MessageService);

  @ViewChild('messageInput', { read: ViewContainerRef }) messageInput!: ViewContainerRef;

  isEmojiPickerOpen: boolean = false;
  isSubmittingDisabled: boolean = true;
  isTagSelectionListOpen: boolean = false;
  taglistType: 'user' | 'channel' = 'user';
  private mentionCounter: number = 0;
  private mentionsCache: Array<{ type: 'user' | 'channel', content: string, id: string }> = [];

  @Input() placeholder: string | null = null;
  @Input() content: string = '';
  @Input() type: string = '';
  @Output() sendMessage = new EventEmitter<string>();
  @Output() cancelEdit = new EventEmitter<void>();
  @Output() saveEdit = new EventEmitter<string>();

  ngOnInit() {
    if(this.content !== '') {
      console.log('this.content', this.content);
    }
    
  }


  onInputChange() {
    this.updateButtonStateBasedOnInput(); 
  }

  updateButtonStateBasedOnInput() {
    const messageInputElement = document.getElementById('messageInput');
     if (messageInputElement) {
       const hasText = !!messageInputElement.textContent?.trim();
       const hasMentions = messageInputElement.getElementsByTagName('app-mention').length > 0;
       this.isSubmittingDisabled = !hasText && !hasMentions;
     }
  }

  onCancelEditClick() {
    this.cancelEdit.emit();
  }

  onSaveEditClick() {
    this.saveEdit.emit(this.content);
  }

  onEmojiButtonClick() {
    this.isEmojiPickerOpen = !this.isEmojiPickerOpen;
  }

  onEmojiOverlayClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.isEmojiPickerOpen = false;
    }
  }

  onEmojiSelected(event: { emoji: { native: string } }) {
    this.content += ' ' + event.emoji.native + ' ';
    this.isEmojiPickerOpen = false;
  }

  private addTagToInput(id: string, name: string, type: 'user' | 'channel') {
    //TODO diese funcution in zwei methoden aufteilen: 1. kompoente hinzufügen, 2.cursor ans ende
    if (this.messageInput) {
      const componentRef = this.messageInput.createComponent(MentionComponent);
      componentRef.setInput('type', type);
      componentRef.setInput('id', id);
      componentRef.setInput('displayName', name);
      componentRef.location.nativeElement.id = `mentionid${this.mentionCounter}`;  // Set the element ID directly
      this.mentionCounter++;
      componentRef.location.nativeElement.contentEditable = false;
      this.messageInput.element.nativeElement.appendChild(componentRef.location.nativeElement);

      this.mentionsCache.push({ type, content: name, id });
      const element = componentRef.location.nativeElement;
      const selection = window.getSelection();
      const range = document.createRange();
      range.setStartAfter(element);
      range.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(range);
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
    const pseudoInput = document.getElementById('messageInput');
    if (pseudoInput) {
      const parsedMessage = this.parseMessageFromContentPartsForDatabase();
      if (parsedMessage !== '') {
        this.sendMessage.emit(parsedMessage);
        pseudoInput.innerHTML = '';
        this.mentionsCache = [];
        this.mentionCounter = 0;
      }
    }
  }

  private parseMessageFromContentPartsForDatabase() {
    const messageInputElement = document.getElementById('messageInput');
    if (!messageInputElement) return '';

    return Array.from(messageInputElement.childNodes)
      .map(part => {
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

