import { Component } from '@angular/core';
import { MessageComponent } from './message/message.component';
import { TimeSeperatorComponent } from './time-seperator/time-seperator.component';
import { Message } from '../models/message';
@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [MessageComponent, TimeSeperatorComponent],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss'
})
export class MainPageComponent {

  messages: Message[] = [];

  constructor() {
    this.messages = [
      { id: '1', content: 'Hello, how are you?', timestamp: new Date(1737047891), isOwn: true, userId: '1' },
      { id: '2', content: 'I am fine, thank you!', timestamp: new Date(1737047891), isOwn: false, userId: '2' },
    ];
  }
}
