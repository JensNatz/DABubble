import { Component, inject, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { ChannelServiceService } from '../../services/firebase-services/channel-service.service';
import { UserService } from '../../services/user.service';
import { LoginService } from '../../services/firebase-services/login-service';
import { SelectionListComponent } from '../selection-list/selection-list.component';

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
  
  loginService: LoginService = inject(LoginService);
  channelService: ChannelServiceService = inject(ChannelServiceService);
  userService: UserService = inject(UserService);
  tags: { id: string; name: string; avatar?: string }[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['type']) {
      this.tags = [];
      this.loadTags();
    }
  }

  private async loadTags() {
    if (this.type === 'user') {
      const userIds = this.channelService.currentChannel?.members || [];
      await this.updateTagsWithUserData(userIds);
     } else {
      if (this.loginService.currentUserValue?.id) {
        const channels = await this.channelService.getAllGroupChannelsWhereUserIsMember(this.loginService.currentUserValue?.id);
        this.updateTagsWithChannelData(channels);
      }
    }
  }

  async updateTagsWithUserData(userIds: string[]) {
    for (const userId of userIds) {
      if (userId) {
        const user = await this.userService.getCompleteUserInfo(userId);
        if (user) {
          this.tags.push({ id: userId, name: user.name, avatar: user.avatar });
        }
      }
    }
  }

  updateTagsWithChannelData(channels: any[]) {
    for (const channel of channels) {
      this.tags.push({ id: channel.id, name: '#'+channel.name });
    }
  }

  onTagClick(index: number) {
    console.log('tag clicked', this.tags[index]);
    // this.tagSelected.emit({ id: this.tags[index].id, name: this.tags[index].name, type: this.type });
  }
 
}
