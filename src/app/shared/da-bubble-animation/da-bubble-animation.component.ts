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
        transform: 'translateX(200px)'
      })),
      state('end', style({
        transform: 'translateX(0px)'
      })),
      transition('start => end', [
        animate('0.5s ease-in-out')

      ])
    ]),
    trigger('slideIn', [
      state('hidden', style({
        left: '0px'
      })),
      state('visible', style({
        left: '100px',
      })),
      transition('hidden => visible', [
        animate('0.5s 1s ease-in-out')

      ])
    ]),
    trigger('moveUpLeft', [
      state('center', style({
        top: '50%',
        left: '50%',
        transform: 'translate(-50%,-50%)'
      })),
      state('topLeft', style({
        top: '75px',
        left: '75px',
        transform: 'translate(0,0)'
      })),
      transition('center => topLeft', [
        animate('1s ease-in-out')
      ])
    ]),
    trigger('shrinkImage', [
      state('normal', style({
        height: '184px'
      })),
      state('small', style({
        height: '70px'
      })),
      transition('normal => small', [
        animate('1s ease-in-out')
      ])
    ]),
    trigger('fadeOut', [
      state('visible', style({
        opacity: 1
      })),
      state('faded', style({
        opacity: 0
      })),
      transition('visible => faded', [
        animate('1s 1s ease-in-out')
      ])
    ])
  ]
})
export class DaBubbleAnimationComponent {
  state = 'start';
  textState = 'hidden';
  logoState = 'center';
  imgState = 'normal';
  containerState = 'visible';

  ngOnInit() {
    setTimeout(() => {
      this.state = 'end';
      this.textState = 'visible';
      setTimeout(() => {
        this.logoState = 'topLeft';
        this.imgState = 'small';
        // this.containerState = 'faded'
      }, 1000);
    }, 500);

  }
}