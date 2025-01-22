import { Component } from '@angular/core';
import { EmojiStatsService } from '../../../services/emoji-stats.service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';


@Component({
  selector: 'app-message-toolbar',
  standalone: true,
  imports: [AsyncPipe, CommonModule, EmojiComponent],
  templateUrl: './message-toolbar.component.html',
  styleUrl: './message-toolbar.component.scss'
})
export class MessageToolbarComponent {
  topEmojis$ = this.emojiStatsService.topEmojis$;

  constructor(private emojiStatsService: EmojiStatsService) {}

  ngOnInit(): void {
    this.emojiStatsService.getTopEmojis();
  }
}
