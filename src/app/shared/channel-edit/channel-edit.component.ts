import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { ChannelServiceService } from '../../services/firebase-services/channel-service.service';
import { MessageBoardComponent } from '../../main-page/message-board/message-board.component';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../../services/firebase-services/login-service';
import { Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-channel-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './channel-edit.component.html',
  styleUrl: './channel-edit.component.scss'
})


export class ChannelEditComponent {

  @Input() channelId: string = '';
  channelName: string = '';
  channelCreator: any = '';
  channelDescription: string = '';
  @Input() closeFunction!: () => void;

  @Output() channelNameChanged = new EventEmitter<string>();
  @Output() channelDescriptionChanged = new EventEmitter<string>();
  

  constructor() {
    this.getCurrentUserData();
  }

  nameEdit = false;
  channelEdit = false;
  tempChannelName: string = this.channelName;
  tempChannelDescription: string = this.channelDescription;
  currentUserId: any = '';
  
  channelService: ChannelServiceService = inject(ChannelServiceService);
  messageBoard: MessageBoardComponent = inject(MessageBoardComponent);
  loginService: LoginService = inject(LoginService);
  modalService = inject(ModalService);

  private channelSubscription: Subscription = new Subscription();

  ngOnInit() {
    this.channelSubscription = this.channelService.currentChannel$.subscribe(async channel => {
      if (channel?.id) {
        this.channelId = channel.id;
        this.channelName = channel.name;
        this.channelCreator = channel.creator;
        this.channelDescription = channel.description;
        this.channelName = channel.name;
      }
    });
  }


  openNameEdit() {
    this.nameEdit = true;
  }


  openChannelEdit() {
    this.channelEdit = true;
  }


  getCurrentUserData() {
    this.loginService.currentUser.subscribe(user => {
      if (user) {
        this.currentUserId = user.id;
      }
    })
  }


  saveNewChannelName(newName: string) {
    if (!newName.trim()) return;
    try {
      this.channelName = newName;
      this.tempChannelName = newName;
      this.nameEdit = false;
      this.channelService.editChannelName(this.channelId, newName);
      this.modalService.updateChannelName(newName);     
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Namens:', error);
    }
  }


  saveNewChannelDescription(newDescription: string) {
    if (!newDescription.trim()) return;
    try {
      this.channelDescription = newDescription;
      this.tempChannelDescription = newDescription;
      this.channelEdit = false;
      this.channelService.editChannelDescription(this.channelId, newDescription);
      this.modalService.updateChannelDescription(newDescription);
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Namens:', error);
    }
  }
  

  channelLeave() {
    this.channelService.removeUserFromChannel(this.channelId, this.currentUserId);
    this.closeFunction();
  }


  ngOnDestroy() {
    this.channelSubscription.unsubscribe();
  }
}
