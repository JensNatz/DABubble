import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {
  private  animationKey = 'animationPlayed';

  constructor() { }

  setAnimationPlayed(): void {
    localStorage.setItem(this.animationKey, 'true');
  }

  hasAnimationPlayed(): boolean {
    return localStorage.getItem(this.animationKey) === 'true';
  }
}