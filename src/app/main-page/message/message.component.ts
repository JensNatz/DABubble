import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarComponent } from '../../shared/avatar/avatar.component';
import { Message } from '../../models/message';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule, AvatarComponent],
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {
  @Input() message!: Message;
  isOwn: boolean;
  content: string;
  timestamp: number;
  userId: string;

  constructor() {
    this.isOwn = false;
    this.content = '';
    this.timestamp = 0;
    this.userId = '';
  }

  ngOnInit() {
    this.isOwn = this.message.isOwn;
    this.content = this.message.content;
    this.timestamp = this.message.timestamp;
    this.userId = this.message.userId;
  }
}
