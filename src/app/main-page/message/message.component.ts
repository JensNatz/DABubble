import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarComponent } from '../../shared/avatar/avatar.component';
import { Message } from '../../models/message';
import { UserService } from '../../services/user.service';
import { ReactionIndicatorComponent } from "./reaction-indicator/reaction-indicator.component";

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule, AvatarComponent, ReactionIndicatorComponent],
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {
  @Input() message!: Message;
  content: string = '';
  timestamp: number = 0;
  authorName: string = 'Unknown User';
  isOwn: boolean = false;
  userId: string = 'YAJxDG5vwYHoCbYjwFhb';
  avatarId: string = '0';
  reactions: [string, Array<string>][] = [];
  reactionNames: any[] = [];
  constructor(private userService: UserService) {}

  async ngOnInit() {
    this.content = this.message.content;
    this.timestamp = this.message.timestamp;
    this.authorName = await this.userService.getUserName(this.message.author);
    this.avatarId = await this.userService.getUserAvatar(this.message.author);
    this.reactions = Object.entries(this.message.reactions || {});
    this.reactionNames = await this.createReactionDisplayArray(this.reactions);

    console.log('this.reactions', this.reactionNames);

    if (this.message.author === this.userId) {
      this.isOwn = true;
    }
  }

  handleReactionToggle(reactionType: string) {
    let reaction = this.reactions.find(reaction => reaction[0] === reactionType);
    if(reaction) {
      const index = reaction[1].indexOf(this.userId);
      if (index !== -1) {
        reaction[1].splice(index, 1);
      } else {
        reaction[1].push(this.userId);
      }
    }
  }

  async createReactionDisplayArray(reactions: [string, Array<string>][]) {
    return Promise.all(
      reactions.map(async reaction => ({
        type: reaction[0],
        users: await Promise.all(
          reaction[1].map(async userId => ({
            id: userId,
            name: await this.userService.getUserName(userId)
          }))
        )
      }))
    );
  }
}
