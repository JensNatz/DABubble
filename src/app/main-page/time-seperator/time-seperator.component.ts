import { Component, Input } from '@angular/core';


@Component({
  selector: 'app-time-seperator',
  standalone: true,
  imports: [],
  templateUrl: './time-seperator.component.html',
  styleUrl: './time-seperator.component.scss'
})
export class TimeSeperatorComponent {
  @Input() timestamp: number = 0;

  get formattedDate(): string {

    const date = new Date(this.timestamp);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return 'Heute';
    }

    return new Intl.DateTimeFormat('de-DE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  }
}
