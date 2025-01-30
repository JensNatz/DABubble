import { Component, Input } from '@angular/core';
import { ChannelServiceService } from '../../../services/firebase-services/channel-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
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

  @Input() closeFunction!: () => void;

  channel: Channel = {
    name: "",
    description: "",
    creator: "",
    members: [],
    type: 'group'
  }  

  constructor(public channelService: ChannelServiceService) {

  }

  onSubmit(ngForm: NgForm) {
    if(ngForm.valid && ngForm.submitted) {
      this.channelService.addNewChannel(this.channel);
      this.closeFunction();
    }   
  }
}
