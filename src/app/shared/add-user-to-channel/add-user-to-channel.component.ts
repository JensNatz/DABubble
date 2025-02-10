import { Component, inject, Input } from '@angular/core';
import { ChannelServiceService } from '../../services/firebase-services/channel-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LoginService } from '../../services/firebase-services/login-service';
import { UserServiceService } from '../../services/firebase-services/user-service.service';
import { UserInfoComponent } from '../user-info/user-info.component';
import { UserAddComponent } from "../user-add/user-add.component";

@Component({
  selector: 'app-add-user-to-channel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UserInfoComponent,
    UserAddComponent
],
  templateUrl: './add-user-to-channel.component.html',
  styleUrls: ['./add-user-to-channel.component.scss']
})
export class AddUserToChannelComponent {

  @Input() channelId: string = '';
  @Input() channelMembers: any[] = [];

  showUserInfo: boolean = false;
  showUserAddInfo: boolean = false;
  selectedUser: any = null;

  usersNames: any[] = [];
  channelName: string = '';
  channelsData: any[] = [];
  channelsDataLength: number = 0;
  currentUserId: any = '';

  channelService: ChannelServiceService = inject(ChannelServiceService);
  userService: UserServiceService = inject(UserServiceService);
  loginService: LoginService = inject(LoginService);



  private channelSubscription: Subscription = new Subscription();

  constructor() {
    this.getCurrentUserData()
  }


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


  getCurrentUserData() {
    this.loginService.currentUser.subscribe(user => {
      if (user) {
        this.currentUserId = user.id;
      }
    })
  }


  async getUserFromChannel() {
    this.channelsData = await this.channelService.getMembersOfChannelWithDetails(this.channelId);
    const currentUserIndex = this.channelsData.findIndex(user => user.id === this.currentUserId);
    if (currentUserIndex !== -1) {
      const [currentUser] = this.channelsData.splice(currentUserIndex, 1);
      currentUser.name += " (Du)";
      this.channelsData.unshift(currentUser);
    }
  }


  ngOnDestroy() {
    this.channelSubscription.unsubscribe();
  }


  getUserId(id: string) {
    console.log(id);

  }


  openUserInfos(user: any) {
    this.selectedUser = user;
    this.showUserInfo = true;
  }


  closeUserInfos() {
    this.showUserInfo = false;
  }


  openUserAddInfos() {
    this.showUserAddInfo = true;
  }


  closeUserAddInfos() {
    this.showUserAddInfo = false;
  }





}
