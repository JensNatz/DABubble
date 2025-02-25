import { Component, Input, inject } from '@angular/core';
import { ChannelServiceService } from '../../../services/firebase-services/channel-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Channel } from '../../../models/channel';
import { LoginService } from '../../../services/firebase-services/login-service';
import { WorkspaceMenuComponent } from '../workspace-menu.component';
import { take } from 'rxjs/operators';

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

  userId: any = '';
  userName: string = '';
  channelExists: boolean = false;
  addChannel = true;
  addUser = false;
  memberOption: string = 'all'; 
  
  @Input() closeFunction!: () => void;

  channel: Channel = {
    name: "",
    description: "",
    creator: this.userName,
    members: [],
    type: 'group'
  }




  loginService: LoginService = inject(LoginService);
  workSpace: WorkspaceMenuComponent = inject(WorkspaceMenuComponent);

  constructor(public channelService: ChannelServiceService) {
    this.getCurrentUserData();
  }


  getCurrentUserData() {
    this.loginService.currentUser.subscribe(user => {
      if (user) {
        this.userId = user.id;
        this.userName = user.name;
      }
    })
  }


  async checkChannelExists() {
    if (!this.channel.name.trim()) {
      this.channelExists = false;
      return;
    }

    this.channelService.getAllChannelsFromDatabase().subscribe(channels => {
      if (channels) {
        this.channelExists = channels.some((ch: Channel) => ch.name.toLowerCase() === this.channel.name.toLowerCase());
      }
    });
  }

  onSubmit(ngForm: NgForm) {
    if (ngForm.valid && !this.channelExists) {
      this.channel = {
        name: this.channel.name,
        description: this.channel.description,
        creator: this.userName,
        members: [this.userId],
        type: 'group'
      };
      
     
      // this.channelService.addNewChannel(this.channel);
      this.addChannel = false;
      this.addUser = true;
      // this.closeFunction();
    }
  }

  
}
