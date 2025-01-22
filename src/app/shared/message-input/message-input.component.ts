import { Component, inject } from '@angular/core';
import { MessageService } from '../../services/firebase-services/message.service';
import { Message } from '../../models/message';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './message-input.component.html',
  styleUrl: './message-input.component.scss'
})
export class MessageInputComponent {
  messageService: MessageService = inject(MessageService);

  channelId: string = '9kacAebjb6GEQZJC7jFL';
  userId: string = 'YAJxDG5vwYHoCbYjwFhb';

  message: Message = {
    content: '',
    timestamp: Date.now(),
    author: this.userId,
    channelId: this.channelId
  };

  postMessage() {
    if (this.message.content.trim()) {
      this.messageService.postMessageToChannel(this.channelId, this.message);
      this.message.content = '';
    }
  }
}

