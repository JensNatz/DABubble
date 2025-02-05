import { Component, Input, inject } from '@angular/core';
import { ChannelServiceService } from '../../../services/firebase-services/channel-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Channel } from '../../../models/channel';
import { LoginService } from '../../../services/firebase-services/login-service';
import { WorkspaceMenuComponent } from '../workspace-menu.component';


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

  onSubmit(ngForm: NgForm) {
    if (ngForm.valid && ngForm.submitted) {
      this.channel = {
        name: this.channel.name,
        description: this.channel.description,
        creator: this.userName,
        members: [this.userId],
        type: 'group'
      }
      
      this.channelService.addNewChannel(this.channel);
      this.workSpace.loadChannels();
      this.closeFunction();
    }
  }
}
