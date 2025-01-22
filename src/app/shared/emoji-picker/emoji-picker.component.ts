import { Component, EventEmitter, Output } from '@angular/core';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';


@Component({
  selector: 'app-emoji-picker',
  standalone: true,
  imports: [PickerComponent],
  templateUrl: './emoji-picker.component.html',
  styleUrl: './emoji-picker.component.scss'
})
export class EmojiPickerComponent {
  @Output() emojiSelected = new EventEmitter<any>();
}
