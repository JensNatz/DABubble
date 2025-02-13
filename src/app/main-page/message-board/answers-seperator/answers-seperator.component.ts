import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-answers-seperator',
  standalone: true,
  imports: [],
  templateUrl: './answers-seperator.component.html',
  styleUrl: './answers-seperator.component.scss'
})
export class AnswersSeperatorComponent {

  @Input() numberOfReplies: number = 0;

  get repliesText(): string {
    return this.numberOfReplies === 0 ? 'Keine Antworten' : `${this.numberOfReplies} Antwort${this.numberOfReplies === 1 ? '' : 'en'}`;
  }

}
