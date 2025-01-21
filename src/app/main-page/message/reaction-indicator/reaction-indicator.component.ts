import { Component, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { MessageService } from '../../../services/firebase-services/message.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reaction-indicator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reaction-indicator.component.html',
  styleUrl: './reaction-indicator.component.scss'
})
export class ReactionIndicatorComponent implements OnChanges {

  @Input() reaction: [string, Array<string>] = ['', []];
  @Output() toggleReaction = new EventEmitter<string>();

  userId: string = 'YAJxDG5vwYHoCbYjwFhb';
  reactionType: string = '';
  reactionImage: string = '';
  reactedUsers: Array<string> = [];
  reactionNames: string = '';

  constructor(private userService: UserService, private messageService: MessageService) {}

  ngOnInit() {
    this.reactionType = this.reaction[0];
    this.reactedUsers = this.reaction[1];
    this.setReactionNames();
    this.setReactionImage();
  }

  // TODO: remove this eventually?
  ngOnChanges(changes: SimpleChanges) {
    if (changes['reaction']) {
      this.reactedUsers = this.reaction[1];
      this.setReactionNames();
    }
  }

  get reactionText(): string {
    if (this.reactedUsers.includes(this.userId) && this.reactedUsers.length === 1) {
      return 'hast reagiert';
    } else if (this.reactedUsers.length > 1) {
      return 'haben reagiert';
    } else {
      return 'hat reagiert';
    }
  }

  get reactionCount(): number {
    return this.reactedUsers.length;
  }

  async handleReactionClick() {
       this.toggleReaction.emit(this.reaction[0]);
   }

  setReactionImage() {
    switch (this.reactionType) {
      case 'highFives':
        this.reactionImage = 'highFive';
        break;
      case 'likes':
        this.reactionImage = 'like';
        break;
      case 'nerdFace':
        this.reactionImage = 'nerdFace';
        break;
      case 'rockets':
        this.reactionImage = 'rocket';
        break;
    }
  }

  async setReactionNames() {
    let ownReactionIncluded = false;
    let otherReactions = [];

    for (let userId of this.reactedUsers) {
        if (userId === this.userId) {
            ownReactionIncluded = true;
        } else {
            const user = await this.userService.getUserName(userId);
            otherReactions.push(user); 
        }
    }
    const totalReactions = this.reactedUsers.length;
    const othersCount = totalReactions - (ownReactionIncluded ? 1 : 0);

    if (totalReactions === 1) {
        this.reactionNames = ownReactionIncluded ? 'Du' : otherReactions[0];
    } else if (totalReactions === 2) {
        this.reactionNames = ownReactionIncluded 
            ? `${otherReactions[0]} und Du` : `${otherReactions[0]} und ${otherReactions[1]}`;
    } else {
        const name1 = otherReactions[0];
        const name2 = ownReactionIncluded ? 'Du' : otherReactions[1];
        this.reactionNames = `${name1}, ${name2} und ${othersCount - 1} weitere`;
    }
}
  }

