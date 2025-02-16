import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../services/modal.service';
import { ChannelServiceService } from '../../services/firebase-services/channel-service.service';
import { LoginService } from '../../services/firebase-services/login-service';
import { UserServiceService } from '../../services/firebase-services/user-service.service';
import { Subscription } from 'rxjs';
import { AddUserToChannelComponent } from '../add-user-to-channel/add-user-to-channel.component';
import { UserAddComponent } from "../user-add/user-add.component";

@Component({
  selector: 'app-modal-user-add',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddUserToChannelComponent,
    UserAddComponent
],
  templateUrl: './modal-user-add.component.html',
  styleUrl: './modal-user-add.component.scss'
})
export class ModalUserAddComponent {

  channelId: string = '';
  channelMembers: any[] = [];
  currentUserId: any = '';
  selectedUser: any = null;
  usersNames: any[] = [];
  channelName: string = '';
  channelsData: any[] = [];
  channelsDataLength: number = 0;

  modalContent: string | null = null;
  private contentSubscription: Subscription;

  channelService: ChannelServiceService = inject(ChannelServiceService);
  userService: UserServiceService = inject(UserServiceService);
  loginService: LoginService = inject(LoginService);

  private channelSubscription: Subscription = new Subscription();

  constructor(private modalService: ModalService) { 
    this.contentSubscription = this.modalService.modalContent$.subscribe(content => {
      this.modalContent = content;
    });
    this.getCurrentUserData();
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

  closeModal() {
    this.modalService.closeModal();
  }
}
