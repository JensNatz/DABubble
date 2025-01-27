import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from '../../services/firebase-services/message.service';
import { FormsModule } from '@angular/forms';
import { EmojiPickerComponent } from '../emoji-picker/emoji-picker.component';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [FormsModule, CommonModule, EmojiPickerComponent],
  templateUrl: './message-input.component.html',
  styleUrl: './message-input.component.scss'
})
export class MessageInputComponent {
  messageService: MessageService = inject(MessageService);
  isEmojiPickerOpen: boolean = false;

  @Input() placeholder: string | null = null;
  @Input() content: string = '';
  @Input() type: string = '';
  @Output() sendMessage = new EventEmitter<string>();
  @Output() cancelEdit = new EventEmitter<void>();
  @Output() saveEdit = new EventEmitter<string>();

  taggedUserId: string = 'lMLhqCH6j71UrMluL6Ob';
  taggedChannelId: string = '9kacAebjb6GEQZJC7jFL';

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


  addUserTagToInput(userId: string) {
    const pseudoInput = document.getElementById('messageInput');
    
    if (pseudoInput) {
      const span = document.createElement('span');
      span.className = 'message-tag';
      span.dataset['userId'] = userId;
      span.contentEditable = 'false';
      span.textContent = '@MaxMustermann';  
      
      pseudoInput.appendChild(span);
      
      // Move cursor to the end
      const selection = window.getSelection();
      const range = document.createRange();
      range.setStartAfter(span);
      range.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(range);

    }
  }

  addChannelTagToInput(channelId: string) {
    const pseudoInput = document.getElementById('messageInput');
    const span = document.createElement('span');
    span.className = 'message-tag';
    span.contentEditable = 'false';
    span.dataset['channelId'] = channelId;
    span.textContent = '#Channel';
    pseudoInput?.appendChild(span);
  }

  onSendClick() {
    const pseudoInput = document.getElementById('messageInput');
    if (pseudoInput) {
      const messageFromInput = pseudoInput.innerHTML;
      const messageToStore = this.messageService.parseContentToStoreOnDatabase(messageFromInput);
      this.sendMessage.emit(messageToStore);
    }
  }

  
}

