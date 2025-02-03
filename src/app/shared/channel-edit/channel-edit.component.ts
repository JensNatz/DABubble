import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-channel-edit',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './channel-edit.component.html',
  styleUrl: './channel-edit.component.scss'
})


export class ChannelEditComponent {
  nameEdit = false;

  openNameEdit() {
    this.nameEdit = true;
  }

  closeNameEdit() {
    this.nameEdit = false;
  }
}
