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
  @Input() avatar: string = '0';
  @Input() border: boolean = false;
  
  
  get avatarImage(): string {
    if (this.avatar >= '0' && this.avatar <= '6') {
      return `assets/img/avatar${this.avatar}.svg`;
    }
    return this.avatar;
  }

  onImageError() {
    this.avatar = '0';
  }
}
