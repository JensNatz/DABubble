import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from '../../services/firebase-services/message.service';
import { ChannelServiceService } from '../../services/firebase-services/channel-service.service';

@Component({
  selector: 'app-mention',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mention.component.html',
  styleUrls: ['./mention.component.scss']
})
export class MentionComponent {
  @Input() type: 'user' | 'channel' = 'user';
  @Input() id: string = '';
  @Input() displayName: string = '';
  @Input() available: boolean = true;

  messageService: MessageService = inject(MessageService);
  channelService: ChannelServiceService = inject(ChannelServiceService);


  get tooltipText() {
    if (!this.available) {
      return this.type === 'channel' ? 'Channel nicht verfügbar' : 'User nicht verfügbar';
    }
    return '';
  }

  handleMentionClick() {
    if (this.available) {
      if (this.type === 'user') {
        this.channelService.setDirectMessageChannel(this.id);
      } else if (this.type === 'channel') {
        this.channelService.setCurrentChannelById(this.id);
      }
    }
  }
}