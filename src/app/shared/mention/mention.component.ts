import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-mention',
  standalone: true,
  templateUrl: './mention.component.html',
  styleUrls: ['./mention.component.scss']
})
export class MentionComponent {
  @Input() type: 'user' | 'channel' = 'user';
  @Input() id: string = '';
  @Input() displayName: string = '';

  handleMentionClick() {
    console.log('Mention clicked with type:', this.type, 'and id:', this.id);
  }
}