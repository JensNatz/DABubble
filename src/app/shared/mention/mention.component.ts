import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

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


  get tooltipText() {
    if (!this.available) {
      return this.type === 'channel' ? 'Channel nicht verfügbar' : 'User nicht verfügbar';
    }
    return '';
  }

  handleMentionClick() {
    if (this.available) {
      console.log('Mention clicked with type:', this.type, 'and id:', this.id);
    }
  }
}