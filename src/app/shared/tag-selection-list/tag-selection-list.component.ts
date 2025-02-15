import { Component, inject, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { ChannelServiceService } from '../../services/firebase-services/channel-service.service';
import { UserService } from '../../services/user.service';
import { LoginService } from '../../services/firebase-services/login-service';
import { SelectionListComponent } from '../selection-list/selection-list.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tag-selection-list',
  standalone: true,
  imports: [SelectionListComponent],
  templateUrl: './tag-selection-list.component.html',
  styleUrl: './tag-selection-list.component.scss'
})
export class TagSelectionListComponent implements OnChanges {
  @Input() type: 'user' | 'channel' = 'user';
  @Output() tagSelected = new EventEmitter<{ id: string; name: string; type: 'user' | 'channel' }>();
  
  private currentChannelSubscription: Subscription;

  loginService: LoginService = inject(LoginService);
  channelService: ChannelServiceService = inject(ChannelServiceService);
  userService: UserService = inject(UserService);
  tags: any;

  constructor() {
    this.currentChannelSubscription = this.channelService.currentChannel$.subscribe(() => {
      if (this.type === 'user') {
        this.loadTags();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['type']) {
      this.tags = {};
      this.loadTags();
    }
  }

  ngOnDestroy() {
    if (this.currentChannelSubscription) {
      this.currentChannelSubscription.unsubscribe();
    }
  }

  private async loadTags() {
    if (this.type === 'user') {
      const userIds = this.channelService.currentChannelValue?.members || [];
      await this.updateTagsWithUserData(userIds);
     } else {
      if (this.loginService.currentUserValue?.id) {
        const channels = await this.channelService.getAllGroupChannelsWhereUserIsMember(this.loginService.currentUserValue?.id);
        this.updateTagsWithChannelData(channels);
      }
    }
  }

  async updateTagsWithUserData(userIds: string[]) {
    let users = [];
    for (const userId of userIds) {
      if (userId) {
        const user = await this.userService.getCompleteUserInfo(userId);
        if (user) {
          users.push(user);
        }
      }
    }
    this.tags = {
      categories: [{
        type: 'user',
        title: 'Mitglieder',
        items: users
      }]
    };
  }

  updateTagsWithChannelData(channels: any[]) {
    this.tags = {
      categories: [{
        type: 'channel',
        title: 'Channels',
        items: channels
      }]
    };
  }


  onTagClick($event: { element: { id: string, name: string }, categoryType: string }) {
    const id = $event.element.id;
    const name = $event.element.name;
    this.tagSelected.emit({ id, name, type: this.type });
  }
 
}
