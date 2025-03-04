import { Component, Input, Output, EventEmitter } from '@angular/core';
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

  @Input() isOwn: boolean = false;
  @Input() canBeRepliedTo: boolean = false;
  @Input() isMessageInMainChannel: boolean = false;
  @Output() toggleReaction = new EventEmitter<string>();
  @Output() addReaction = new EventEmitter<MouseEvent>();
  @Output() editMessage = new EventEmitter<void>();
  @Output() addReply = new EventEmitter<void>();
  topEmojis$ = this.emojiStatsService.topEmojis$;
  isOptionsMenuOpen = false;

  constructor(private emojiStatsService: EmojiStatsService) {}

  ngOnInit(): void {
    this.emojiStatsService.getTopEmojis();
  }

  handleReactionClick(emoji: string) {
    this.toggleReaction.emit(emoji);
  }

  handleAddReactionClick(event: MouseEvent) {
    this.addReaction.emit(event);
  }

  handleCommentClick() {
    this.addReply.emit();
  }

  toggleOptionsMenu() {
    this.isOptionsMenuOpen = !this.isOptionsMenuOpen;
  }

  handleEditMessageClick() {
    this.editMessage.emit();
  }
}
