import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectionListComponent } from '../selection-list/selection-list.component';
import { ChannelServiceService } from '../../services/firebase-services/channel-service.service';
import { UserServiceService } from '../../services/firebase-services/user-service.service';
import { LoginService } from '../../services/firebase-services/login-service';
import { Channel } from '../../models/channel';
import { User } from '../../models/user';
import { Subscription, from } from 'rxjs';

@Component({
  selector: 'app-recipient-selector',
  standalone: true,
  imports: [SelectionListComponent, FormsModule],
  templateUrl: './recipient-selector.component.html',
  styleUrl: './recipient-selector.component.scss'
})
export class RecipientSelectorComponent implements OnInit, OnDestroy {

  inputValue: string = '';
  channelService = inject(ChannelServiceService);
  userService = inject(UserServiceService);
  loginService = inject(LoginService);

  private userId: string = '';

  private channels: Channel[] = [];
  private filteredChannels: Channel[] = [];
  private users: User[] = [];
  private filteredUsers: User[] = [];

  filteredResults: {id: string, name: string, type: string}[] = [];
  listShown: boolean = false;

  private subscription = new Subscription();

  ngOnInit() {
    this.subscription.add(
      this.loginService.currentUser.subscribe(user => {
        if (user?.id) {
          this.userId = user.id;
          this.setupChannelSubscription();
        }
      })
    );

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

  onInputChange(value: string): void {
    this.inputValue = value;
    if(this.inputValue.length === 0) {
      this.listShown = false;
      return;
    }
  
    if (value.startsWith('#')) {
      this.filterChannels(value);
    } else if (value.startsWith('@')) {
      this.filterUsersByName(value);
    } else {
      this.filterUsersByEmail(value);
    }
    this.listShown = true;
  }

  private filterChannels(input: string): void {
    const searchTerm = input.replace('#', '').toLowerCase();
    this.filteredChannels = this.channels.filter(channel => 
      channel.name.toLowerCase().includes(searchTerm)
    );

    const mappedChannels = this.filteredChannels
      .filter((channel): channel is Channel & { id: string } => typeof channel.id === 'string')
      .map(channel => ({id: channel.id, name: channel.name, type: 'channel'}));

    this.filteredResults = mappedChannels;
  }

  private filterUsers(input: string, criterion: 'name' | 'email'): void {
    const searchTerm = criterion === 'name' ? input.replace('@', '').toLowerCase() : input.toLowerCase();
    
    this.filteredUsers = this.users.filter(user => 
      user[criterion].toLowerCase().includes(searchTerm)
    );

    const mappedUsers = this.filteredUsers
      .filter((user): user is User & { id: string } => typeof user.id === 'string')
      .map(user => ({id: user.id, name: user.name, email: user.email, avatar: user.avatar, type: 'user'}));

    this.filteredResults = mappedUsers;
  }
  
  private filterUsersByName(input: string): void {
    this.filterUsers(input, 'name');
  }
  
  private filterUsersByEmail(input: string): void {
    this.filterUsers(input, 'email');
  }
  

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onRecipientSelected(recipient: any): void {
    this.listShown = false;
    if(recipient.type === 'channel') {
       this.channelService.setCurrentChannelById(recipient.id);
    } else if(recipient.type === 'user') {
      this.channelService.setDirectMessageChannel(recipient.id);
    }
  }
}
