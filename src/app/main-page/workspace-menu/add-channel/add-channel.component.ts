import { Component } from '@angular/core';
import { ChannelServiceService } from '../../../services/firebase-services/channel-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Channel } from '../../../models/channel';

@Component({
  selector: 'app-add-channel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './add-channel.component.html',
  styleUrl: './add-channel.component.scss'
})
export class AddChannelComponent {

  name = "";
  description = "";

  constructor(public channelService: ChannelServiceService) {

  }

  addNewChannel() {
    let channel: Channel  = {
      name: this.name,
      description: this.description,
      creator: "",
      members: [],
    }
    this.channelService.addNewChanel(channel)
  }
}
