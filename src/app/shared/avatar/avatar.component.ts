import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss'
})
export class AvatarComponent {
  @Input() size: 'small' | 'standard' | 'large' = 'standard';
  
  private _avatarId: string = '1';
  @Input()
  set avatarId(value: string) {
    this._avatarId = /^[1-6]$/.test(value) ? value : '0';
  }
  get avatarId(): string {
    return this._avatarId;
  }
}
