import { Component } from '@angular/core';
import { MessageBoardComponent } from './message-board/message-board.component';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [MessageBoardComponent],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss'
})
export class MainPageComponent {

  
}
