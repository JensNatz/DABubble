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

  channelId: string = '9kacAebjb6GEQZJC7jFL';
  userId: string = 'YAJxDG5vwYHoCbYjwFhb';

  isEmojiPickerOpen: boolean = false;

  @Input() placeholder: string | null = null;
  @Input() content: string = '';
  @Input() type: string = '';
  @Output() sendMessage = new EventEmitter<string>();
  @Output() cancelEdit = new EventEmitter<void>();
  @Output() saveEdit = new EventEmitter<string>();

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

  onSendClick() {
    this.sendMessage.emit(this.content);
    console.log(this.content);
    this.content = '';

  }
}

