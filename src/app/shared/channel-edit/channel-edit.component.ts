import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { ChannelServiceService } from '../../services/firebase-services/channel-service.service';
import { MessageBoardComponent } from '../../main-page/message-board/message-board.component';
import { FormsModule } from '@angular/forms';

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

  nameEdit = false;
  channelEdit = false;
  tempChannelName: string = this.channelName;

  channelService: ChannelServiceService = inject(ChannelServiceService);
  messageBoard: MessageBoardComponent = inject(MessageBoardComponent);


  openNameEdit() {
    this.nameEdit = true;
  }

  openChannelEdit() {
    this.channelEdit = true;
  }


  closeChannelEdit() {
    this.channelEdit = false;
  }

  saveNewChannelName(newName: string) {
    if (!newName.trim()) return; 
    try {
      this.channelName = newName;
      this.tempChannelName = newName;
      this.nameEdit = false;
      this.channelService.editChannelName(this.channelId, newName);
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Namens:', error);
    } 
  }


  saveNewChannelDescription() {
    
  }

  channelLeave() {
    
  }
}
