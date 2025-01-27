import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
@Component({
  selector: 'app-reaction-indicator',
  standalone: true,
  imports: [CommonModule, EmojiComponent],
  templateUrl: './reaction-indicator.component.html',
  styleUrl: './reaction-indicator.component.scss'
})
export class ReactionIndicatorComponent  {

  @Input() reaction: any = [];
  @Output() toggleReaction = new EventEmitter<string>();

  // TODO: get userId from auth service
  userId: string = 'YAJxDG5vwYHoCbYjwFhb';
  reactionType: string = '';
  reactedUsers: Array<string> = [];

  ngOnInit() {
    this.reactionType = this.reaction.type;
    this.reactedUsers = this.reaction.users;
  }

  get reactionText(): string {
    const hasCurrentUser = this.reaction.users.some((user: {id: string, name: string}) => user.id === this.userId);
    if (hasCurrentUser && this.reaction.users.length === 1) {
      return 'hast reagiert';
    } else if (this.reaction.users.length > 1) {
      return 'haben reagiert';
    } else {
      return 'hat reagiert';
    }
  }

  get reactionNames(): string {
    const users = this.reaction.users;
    if (users.length === 1) {
      return users[0].name;
    } else if (users.length === 2) {
      const otherUser = users.find((user: { id: string, name: string }) => user.id !== this.userId)!;
      const currentUser = users.find((user: { id: string, name: string }) => user.id === this.userId)!;
      return currentUser 
        ? `${otherUser.name} und ${currentUser.name}`
        : `${users[0].name} und ${users[1].name}`;
    } else {
      const othersCount = users.length - 2;
      if (users.some((user: { id: string, name: string }) => user.id === this.userId)) {
        const otherUser = users.find((user: { id: string, name: string }) => user.id !== this.userId)!;
        const currentUser = users.find((user: { id: string, name: string }) => user.id === this.userId)!;
        return `${otherUser.name}, ${currentUser.name} und ${othersCount} weitere`;
      }
      return `${users[0].name}, ${users[1].name} und ${othersCount} weitere`;
    }
  }

  get reactionCount(): number {
    return this.reaction.users.length;
  }

  handleReactionClick() {
    this.toggleReaction.emit(this.reaction.type);
  }

}

