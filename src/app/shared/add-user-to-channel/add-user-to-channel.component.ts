import { Component, inject, Input } from '@angular/core';
import { ChannelServiceService } from '../../services/firebase-services/channel-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LoginService } from '../../services/firebase-services/login-service';
import { UserServiceService } from '../../services/firebase-services/user-service.service';

@Component({
  selector: 'app-add-user-to-channel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './add-user-to-channel.component.html',
  styleUrls: ['./add-user-to-channel.component.scss']
})
export class AddUserToChannelComponent {

  @Input() channelId: string = '';
  @Input() channelMembers: any[] = [];

  usersNames: any[] = [];
  channelName: string = '';
  channelsData: any[] = [];
  channelsDataLength: number = 0;

  channelService: ChannelServiceService = inject(ChannelServiceService);
  userService: UserServiceService = inject(UserServiceService);
  loginService: LoginService = inject(LoginService);

  private channelSubscription: Subscription = new Subscription();

  constructor() {}

  ngOnInit() {
    this.channelSubscription = this.channelService.currentChannel$.subscribe(async channel => {
      if (channel?.id) {
        this.channelId = channel.id;
        this.channelName = channel.name;        
        this.channelMembers = channel.members || [];
        this.getUserFromChannel();
      }
    });
  }


  async getUserFromChannel() {
    this.channelsData = await this.channelService.getMembersOfChannelWithDetails(this.channelId); 
    this.channelsDataLength = this.channelsData.length;   
  }


  ngOnDestroy() {
    this.channelSubscription.unsubscribe();
  }

}
