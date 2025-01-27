import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from '../../services/firebase-services/message.service';
import { FormsModule } from '@angular/forms';
import { EmojiPickerComponent } from '../emoji-picker/emoji-picker.component';
import { UserSelectionListComponent } from '../user-selection-list/user-selection-list.component';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';


@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [FormsModule, CommonModule, EmojiPickerComponent, UserSelectionListComponent, ClickOutsideDirective],
  templateUrl: './message-input.component.html',
  styleUrl: './message-input.component.scss'
})
export class MessageInputComponent {

  private messageInputContentAsPlainText: string = '';
  messageService: MessageService = inject(MessageService);
  isEmojiPickerOpen: boolean = false;
  isButtonDisabled: boolean = true;
  isUserSelectionListOpen: boolean = false;

  @Input() placeholder: string | null = null;
  @Input() content: string = '';
  @Input() type: string = '';
  @Output() sendMessage = new EventEmitter<string>();
  @Output() cancelEdit = new EventEmitter<void>();
  @Output() saveEdit = new EventEmitter<string>();



  onInputChange() {
    this.updateInternalContent();
    this.updateButtonStateBasedOnInput();
  }

  updateInternalContent() {
    const messageInputElement = document.getElementById('messageInput');
    if (messageInputElement) {
      let plainText = messageInputElement.innerHTML;

      plainText = plainText.replace(
        /<span[^>]*data-user-id="([^"]+)"[^>]*>@[^<]+<\/span>/g,
        (_, userId) => `@{[${userId}]}`
      );
      plainText = plainText.replace(
        /<span[^>]*data-channel-id="([^"]+)"[^>]*>#[^<]+<\/span>/g,
        (_, channelId) => `#{[${channelId}]}`
      );

      plainText = plainText.replace(/&nbsp;/g, ' ');

      this.messageInputContentAsPlainText = plainText;
    }

    console.log(this.messageInputContentAsPlainText);
  }


  updateButtonStateBasedOnInput() {
    this.isButtonDisabled = this.messageInputContentAsPlainText.trim().length === 0;
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

  private addTagToInput(id: string, type: 'user' | 'channel') {
    const pseudoInput = document.getElementById('messageInput');
    
    if (pseudoInput) {
      const span = document.createElement('span');
      span.className = 'message-tag';
      span.contentEditable = 'false';

      if (type === 'user') {
        span.dataset['userId'] = id;
        span.textContent = '@MaxMustermann';
        this.messageInputContentAsPlainText += `@{[${id}]} `;
      } else {
        span.dataset['channelId'] = id;
        span.textContent = '#Channel';
        this.messageInputContentAsPlainText += `#{[${id}]} `;
      }
      
      pseudoInput.appendChild(span);

      const selection = window.getSelection();
      const range = document.createRange();
      range.setStartAfter(span);
      range.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(range);

      this.updateInternalContent();
    }
  }

  addUserTagToInput(userId: string) {
    this.addTagToInput(userId, 'user');
  }

  addChannelTagToInput(channelId: string) {
    this.addTagToInput(channelId, 'channel');
  }

  onSendClick() {
    const pseudoInput = document.getElementById('messageInput');
    if (pseudoInput) {
      this.sendMessage.emit(this.messageInputContentAsPlainText);
      pseudoInput.innerHTML = '';
      this.updateInternalContent();
    }
  }

  onTagIconClick() {
    this.isUserSelectionListOpen = !this.isUserSelectionListOpen;
  }

  onUserSelected(user: { id: string; name: string; avatar: string }) {
    let userId = user.id;
    // this.addUserTagToInput(userId);
    console.log('ich würde gerne ein tag zu meinem input hinzufügen, muss das aber mit einer komponente machen, die ich hier nicht habe');
    this.isUserSelectionListOpen = false;
  }

  onUserListClickOutside() {
    this.isUserSelectionListOpen = false;
  }
}

