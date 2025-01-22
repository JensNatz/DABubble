import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [RouterModule,FormsModule,CommonModule ],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss'
})
export class AvatarComponent {

  avatarImages={
    '1': '../../../assets/img/avatar1.svg',
    '2': '../../../assets/img/avatar2.svg',
    '3': '../../../assets/img/avatar3.svg',
    '4': '../../../assets/img/avatar4.svg',
    '5': '../../../assets/img/avatar5.svg',
    '6': '../../../assets/img/avatar6.svg'
  }

  selectedAvatar: string = '../../../assets/img/standard_avatar.svg';
  userName: string = 'Stephan Zager';

  selectAvatar(avatar: string) {
    this.selectedAvatar = avatar;
  }
}
