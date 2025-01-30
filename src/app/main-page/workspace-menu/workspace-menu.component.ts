import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChannelServiceService } from '../../services/firebase-services/channel-service.service';
import { AddChannelComponent } from './add-channel/add-channel.component';
import { Channel } from '../../models/channel';
import { LoginService } from '../../services/firebase-services/login-service';

@Component({
  selector: 'app-workspace-menu',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddChannelComponent,
  ],
  templateUrl: './workspace-menu.component.html',
  styleUrl: './workspace-menu.component.scss'
})
export class WorkspaceMenuComponent { 
  
  isOpenChannelListe = true;
  isOpenUserListe = true;
  channels: Channel[] = [];
  loginService: LoginService = inject(LoginService);

  public showModal: boolean = false;

  constructor(public channelService: ChannelServiceService) { }

  ngOnInit() {
    this.loginService.currentUser.subscribe(user => {
      if (user) {
        this.loadChannels();
      } 
    });
  }

  async loadChannels() {
    const userId = this.loginService.currentUserValue?.id;
    if (!userId) {
      console.log('No user ID available');
      return;
    }
    this.channels = await this.channelService.getAllGroupChannelsWhereUserIsMember(userId) as Channel[];
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
    this.isOpenUserListe  = !this.isOpenUserListe ; 
  }

  switchToGroupChannel(channel: Channel) {
    this.channelService.currentChannel = channel;
  }
  switchToDirectMessageChannel(userId: string) {
    this.channelService.setDirectMessageChannel(userId);
  }
}

