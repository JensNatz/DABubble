import { Injectable, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { from } from 'rxjs';
import { ChannelServiceService } from './firebase-services/channel-service.service';
import { UserServiceService } from './firebase-services/user-service.service';
import { MessageService } from './firebase-services/message.service';
import { LoginService } from './firebase-services/login-service';
import { Channel } from '../models/channel';
import { User } from '../models/user';
import { Message } from '../models/message';
@Injectable({
  providedIn: 'root'
})
export class SearchService {

  private subscription = new Subscription();
  private userId: string = '';
  private channels: Channel[] = [];
  private users: User[] = [];
  private messages: Message[] = [];
  channelService = inject(ChannelServiceService);
  userService = inject(UserServiceService);
  loginService = inject(LoginService);
  messageService = inject(MessageService);

  constructor() {
    this.subscription.add(
      this.loginService.currentUser.subscribe(user => {
        if (user?.id) {
          console.log('search service init');
          this.userId = user.id;
          this.setupChannelSubscription();
          this.setupUserSubscription();
          this.setupMessageSubscription();
        }
      })
    );
  }


  filterChannelsByName(input: string) {
    return this.channels.filter(channel => channel.name.toLowerCase().includes(input.toLowerCase()));
  }

  filterUsersByName(input: string) {
    return this.users.filter(user => user.name.toLowerCase().includes(input.toLowerCase()));
  }

  filterUsersByEmail(input: string) {
    return this.users.filter(user => user.email.toLowerCase().includes(input.toLowerCase()));
  }

  filterMessagesByContent(input: string) {
    return this.messages.filter(message => {
      message.content = this.parseMessageContent(message.content);
      console.log(message.content);
      return message.content.toLowerCase().includes(input.toLowerCase());
    });
  }

  private parseMessageContent(content: string): string {
    // Replace user mentions in format @{[userId]}
    let parsedContent = content.replace(/@{\[(.*?)\]}/g, (match, userId) => {
      const user = this.users.find(u => u.id === userId);
      return user ? ` @${user.name} ` : ' @Unknown User ';
    });

    // Replace channel mentions in format #{[channelId]}
    parsedContent = parsedContent.replace(/#{\[(.*?)\]}/g, (match, channelId) => {
      const channel = this.channels.find(c => c.id === channelId);
      return channel ? ` #${channel.name} ` : ' #Unknown Channel ';
    });

    return parsedContent;
  }

  private setupUserSubscription() {
    this.subscription.add(
      this.userService.getUsers().subscribe(users => {
        this.users = users as User[];
      })
    );
  }

  private setupChannelSubscription() {
    this.subscription.add(
      from(this.channelService.getAllGroupChannelsWhereUserIsMember(this.userId))
        .subscribe(channels => {
          this.channels = channels as Channel[];
        })
    );
  }

  private setupMessageSubscription() {
    this.subscription.add(
      this.messageService.getAllMessagesOfUser(this.userId).subscribe(messages => {
        this.messages = messages as Message[];
      })
    );
  }



}
