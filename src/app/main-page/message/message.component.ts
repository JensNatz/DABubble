import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarComponent } from '../../shared/avatar/avatar.component';
import { Message } from '../../models/message';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule, AvatarComponent],
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

  constructor(private userService: UserService) {}

  async ngOnInit() {
    this.content = this.message.content;
    this.timestamp = this.message.timestamp;
    this.authorName = await this.userService.getUserName(this.message.author);
    this.avatarId = await this.userService.getUserAvatar(this.message.author);

    if (this.message.author === this.userId) {
      this.isOwn = true;
    }
  }
}
