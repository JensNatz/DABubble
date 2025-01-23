import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from '../../services/firebase-services/message.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './message-input.component.html',
  styleUrl: './message-input.component.scss'
})
export class MessageInputComponent {
  messageService: MessageService = inject(MessageService);

  channelId: string = '9kacAebjb6GEQZJC7jFL';
  userId: string = 'YAJxDG5vwYHoCbYjwFhb';

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

  // message: Message = {
  //   content: '',
  //   timestamp: Date.now(),
  //   author: this.userId,
  //   channelId: this.channelId
  // };

  // postMessage() {
  //   if (this.message.content.trim()) {
  //     this.messageService.postMessageToChannel(this.channelId, this.message);
  //     this.message.content = '';
  //   }
  // }
}

