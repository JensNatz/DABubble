import { Component, inject } from '@angular/core';
import { ChannelServiceService } from '../../services/firebase-services/channel-service.service';
import { UserService } from '../../services/user.service';
import { AvatarComponent } from '../avatar/avatar.component';
import { Output, EventEmitter } from '@angular/core';
@Component({
  selector: 'app-user-selection-list',
  standalone: true,
  imports: [AvatarComponent],
  templateUrl: './user-selection-list.component.html',
  styleUrl: './user-selection-list.component.scss'
})
export class UserSelectionListComponent {
  @Output() userSelected = new EventEmitter<{ id: string; name: string; avatar: string }>();
  
  channelService: ChannelServiceService = inject(ChannelServiceService);
  userService: UserService = inject(UserService);
  users: { id: string; name: string; avatar: string }[] = [];

  constructor() {
    this.updateUsersWithNames(this.channelService.currentChannel?.members || []);
  }

  async updateUsersWithNames(userIds: string[]) {
    for (const userId of userIds) {
      const user = await this.userService.getCompleteUserInfo(userId);
      this.users.push({ id: userId, name: user.name, avatar: user.avatar });
    }
  }

  onUserClick(user: { id: string; name: string; avatar: string }) {
    this.userSelected.emit(user);
  }
 
}
