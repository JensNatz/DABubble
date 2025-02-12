import { Component } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-da-bubble-animation',
  standalone: true,
  templateUrl: './da-bubble-animation.component.html',
  imports: [CommonModule],
  styleUrls: ['./da-bubble-animation.component.scss'],
  animations: [
    trigger('fadeInMoveLeft', [
      state('start', style({
        opacity: 1,
        transform: 'translateX(100px)'
      })),
      state('end', style({
        opacity: 1,
        transform: 'translateX(0px)'
      })),
      transition('start => end', [
        animate('500ms 1s ease-in-out')
      ])
    ]),
    trigger('slideIn', [
      state('hidden', style({
        opacity: 0,
        right: '100%'
      })),
      state('visible', style({
        opacity: 1,
        right: '0'
      })),
      transition('hidden => visible', [
        animate('500ms 1s ease-in-out')
      ])
    ]),
    trigger('moveUpLeft', [
      state('center', style({
        transform: 'translate(0, 0)'
      })),
      state('topLeft', style({
        transform: 'translate(-175%,-175%)',  
          
      })),
      transition('center => topLeft', [
        animate('1s ease-in-out')
      ])
    ])
  ]
})
export class DaBubbleAnimationComponent {
  state = 'start';
  textState = 'hidden';
  logoState = 'center';

  ngOnInit() {
    setTimeout(() => {
      this.state = 'end';
      this.textState = 'visible';
      setTimeout(() => {
        this.logoState = 'topLeft';
      }, 2000);
    }, 1000);
  }
}