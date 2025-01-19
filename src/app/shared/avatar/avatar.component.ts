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
  @Input() avatarId: string = '1';


  async ngOnInit() {
    console.log('avatarId: ', this.avatarId);
  }
}
