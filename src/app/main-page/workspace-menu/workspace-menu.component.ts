import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChannelServiceService } from '../../services/firebase-services/channel-service.service';
import { AddChannelComponent } from './add-channel/add-channel.component';
import { Channel } from '../../models/channel';
import { LoginService } from '../../services/firebase-services/login-service';
import { LoadingIndicatorComponent } from '../../shared/loading-indicator/loading-indicator.component';
import { UserServiceService } from '../../services/firebase-services/user-service.service';
import { User } from '../../models/user';
import { AvatarComponent } from '../../shared/avatar/avatar.component';
import { firstValueFrom } from 'rxjs';
import { MessageboardService } from '../../services/messageboard.service';
import { TruncatePipe } from '../../pipes/truncate.pipe';
@Component({
  selector: 'app-workspace-menu',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddChannelComponent,
    LoadingIndicatorComponent,
    AvatarComponent,
    TruncatePipe
  ],
  templateUrl: './workspace-menu.component.html',
  styleUrl: './workspace-menu.component.scss'
})
export class WorkspaceMenuComponent {

  loginService: LoginService = inject(LoginService);
  userService: UserServiceService = inject(UserServiceService);
  messageboardService: MessageboardService = inject(MessageboardService);

  isOpenChannelListe = true;
  isOpenUserListe = true;
  channels: any[] = [];
  users: User[] = [];
  otherUsers: User[] = [];
  loggedInUser: User | null = null;
  loading: boolean = false;
  activeChannel: Channel | null = null;

  public showModal: boolean = false;

  constructor(public channelService: ChannelServiceService) { }

  ngOnInit() {
    this.loading = true;
    this.loginService.currentUser.subscribe(async user => {
      if (user?.id) {
        this.userService.getUserById(user.id).subscribe(updatedUser => {
          this.loggedInUser = updatedUser;
        });
        this.loadChannels();
        this.loadUsers();
        this.loading = false;
      }
    });

    this.channelService.currentChannel$.subscribe(channel => {
      this.activeChannel = channel;
    });
  }

  isActiveGroupChannel(channel: Channel): boolean {
    if (channel.type !== 'group') return false;
    return channel.id === this.activeChannel?.id;
  }

  isActiveDirectMessageChannel(userId: string): boolean {
    if (this.activeChannel?.type !== 'direct') return false;
    return this.activeChannel?.members?.length === 2 &&
    this.activeChannel?.members?.includes(userId);
  }

  isActivePersonalMessageChannel(): boolean {
    if (this.activeChannel?.type !== 'direct' || !this.loggedInUser?.id) return false;
    return this.activeChannel?.members?.length === 1 &&
    this.activeChannel?.members?.includes(this.loggedInUser?.id);
  }

  loadChannels() {
    const userId = this.loginService.currentUserValue?.id;
    if (!userId) return;
    this.channelService.getUserChannels(userId).subscribe(channels => {
      this.channels = channels;
    });
  }

  async loadUsers() {
    const users = await firstValueFrom(this.userService.getUsers());
    this.otherUsers = users.filter(user => user.id !== this.loginService.currentUserValue?.id);
  }

  openAddChannel() {
    this.showModal = true;
  }

  closeAddChannel() {
    this.showModal = false;
  }

  toggleMenuChannel() {
    this.isOpenChannelListe = !this.isOpenChannelListe;
  }

  toggleMenuUser() {
    this.isOpenUserListe = !this.isOpenUserListe;
  }

  switchToGroupChannel(channel: Channel) {
    if (this.channelService.currentChannelValue?.id !== channel.id) {
      this.channelService.setCurrentChannel(channel);
      this.messageboardService.openMessageBoard();
    }
  }

  switchToDirectMessageChannel(userId: string) {
    this.channelService.setDirectMessageChannel(userId);
    this.messageboardService.openMessageBoard();
  }
  
  onNewMessageClick() {
    this.channelService.clearCurrentChannel();
    this.messageboardService.openMessageBoard();
  }
}

