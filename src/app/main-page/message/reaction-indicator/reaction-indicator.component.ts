import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { LoginService } from '../../../services/firebase-services/login-service';

@Component({
  selector: 'app-reaction-indicator',
  standalone: true,
  imports: [CommonModule, EmojiComponent],
  templateUrl: './reaction-indicator.component.html',
  styleUrl: './reaction-indicator.component.scss'
})
export class ReactionIndicatorComponent  {

  loginService: LoginService = inject(LoginService);

  @Input() reaction: any = [];
  @Output() toggleReaction = new EventEmitter<string>();

  reactionType: string = '';
  reactedUsers: Array<string> = [];

  ngOnInit() {
    this.reactionType = this.reaction.type;
    this.reactedUsers = this.reaction.users;
  }

  get reactionText(): string {
    const hasCurrentUser = this.reaction.users.some((user: {id: string, name: string}) => user.id === this.loginService.currentUserValue?.id);
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
      const otherUser = users.find((user: { id: string, name: string }) => user.id !== this.loginService.currentUserValue?.id)!;
      const currentUser = users.find((user: { id: string, name: string }) => user.id === this.loginService.currentUserValue?.id)!;
      return currentUser 
        ? `${otherUser.name} und ${currentUser.name}`
        : `${users[0].name} und ${users[1].name}`;
    } else {
      const othersCount = users.length - 2;
      if (users.some((user: { id: string, name: string }) => user.id === this.loginService.currentUserValue?.id)) {
        const otherUser = users.find((user: { id: string, name: string }) => user.id !== this.loginService.currentUserValue?.id)!;
        const currentUser = users.find((user: { id: string, name: string }) => user.id === this.loginService.currentUserValue?.id)!;
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

