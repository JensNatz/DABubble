import { Component, Input, OnInit  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChannelServiceService } from '../../services/firebase-services/channel-service.service';
import { AddChannelComponent } from './add-channel/add-channel.component';
import { Router } from '@angular/router'; // Für Navigation
import { Channel } from '../../models/channel';

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

  public showModal: boolean = false;

  constructor(public channelService: ChannelServiceService, private router: Router) { 
      this.channelService.getAllChannelsFromDatabase().subscribe((channels) => {
        this.channels = channels as Channel[];
      });
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

