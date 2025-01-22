import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarComponent } from '../../shared/avatar/avatar.component';
import { Message } from '../../models/message';
import { ReactionUser } from '../../models/reaction-user';
import { UserService } from '../../services/user.service';
import { ReactionIndicatorComponent } from "./reaction-indicator/reaction-indicator.component";
import { MessageService } from '../../services/firebase-services/message.service';
import { EmojiPickerComponent } from '../../shared/emoji-picker/emoji-picker.component';
import { log } from 'console';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule, AvatarComponent, ReactionIndicatorComponent, EmojiPickerComponent],
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {
  messageService: MessageService = inject(MessageService);
  @Input() message!: Message;
  content: string = '';
  timestamp: number = 0;
  authorName: string = 'Unknown User';
  isOwn: boolean = false;
  showEmojiPicker: boolean = false;
  // TODO: get user id from auth service
  userId: string = 'YAJxDG5vwYHoCbYjwFhb';
  // TODO: get channel id from ???
  channelId: string = '9kacAebjb6GEQZJC7jFL';
  avatarId: string = '0';
  reactionWithNames: Array<{ type: string; users: ReactionUser[] }> = [];
  constructor(private userService: UserService) {}

  async ngOnInit() {
    this.content = this.message.content;
    this.timestamp = this.message.timestamp;
    this.authorName = await this.userService.getUserName(this.message.author);
    this.avatarId = await this.userService.getUserAvatar(this.message.author);
    this.reactionWithNames = await this.createReactionDisplayArray(this.message.reactions);

    if (this.message.author === this.userId) {
      this.isOwn = true;
    }
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  handleEmojiSelection(event: any) {
    console.log('Selected emoji:', event.emoji.id);
    this.showEmojiPicker = false;
  }

  handleReactionToggle(reactionType: string) {
    console.log('Reaction type:', reactionType);
    let reaction = this.reactionWithNames.find((reaction: { type: string, users: ReactionUser[] }) => reaction.type === reactionType);
    if(reaction && this.message.id) {
      const hasUser = reaction.users.some((user: ReactionUser) => user.id === this.userId);
      if (hasUser) {
        console.log('remove reaction', reactionType);
        reaction.users = reaction.users.filter((user: ReactionUser) => user.id !== this.userId);
        this.messageService.removeReactionFromMessage(this.message.id, reactionType, this.userId);
      } else {
        console.log('add reaction');
        reaction.users.push({ id: this.userId, name: 'Du' }); 
        this.messageService.addReactionToMessage(this.message.id, reactionType, this.userId);
      }
    }
  }

  async createReactionDisplayArray(reactions: [] | undefined) {
    if (!reactions) return [];
    const entries = Object.entries(reactions);
    return Promise.all(
      entries.map(async reaction => ({
        type: reaction[0],
        users: await Promise.all(
          (reaction[1] as string[]).map(async (userId: string) => ({
            id: userId,
            name: userId === this.userId ? 'Du' : await this.userService.getUserName(userId)
          }))
        )
      }))
    );
  }
}
