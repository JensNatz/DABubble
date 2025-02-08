import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { ChannelServiceService } from '../../services/firebase-services/channel-service.service';
import { MessageBoardComponent } from '../../main-page/message-board/message-board.component';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../../services/firebase-services/login-service';
import { Output, EventEmitter } from '@angular/core';

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
  @Input() channelName: string = '';
  @Input() channelCreator: any = '';
  @Input() channelDescription: string = '';
  @Input() closeFunction!: () => void;

  @Output() channelNameChanged = new EventEmitter<string>();

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
      
      // Neuen Namen an MessageBoardComponent weitergeben
      this.channelNameChanged.emit(newName);
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
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Namens:', error);
    }     
  }

  channelLeave() {    
    this.channelService.removeUserFromChannel(this.channelId, this.currentUserId); 
    this.closeFunction();
  }
}
