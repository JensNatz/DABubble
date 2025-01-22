import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmojiStatsService {
  private emojiStatsCache: Record<string, number> | null = null;
  private topEmojisSubject = new BehaviorSubject<string[]>([]);
  topEmojis$ = this.topEmojisSubject.asObservable();

  constructor(private ngZone: NgZone) {
    window.addEventListener('storage', (event) => {
      if (event.key === 'emoji-mart.frequently') {
        this.ngZone.run(() => {
          this.emojiStatsCache = event.newValue ? JSON.parse(event.newValue) : {};
          const topEmojis = this.getTopEmojis();
          this.topEmojisSubject.next(topEmojis);
        });
      }
    });

    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    this.emojiStatsCache = JSON.parse(localStorage.getItem('emoji-mart.frequently') || '{}');
    const topEmojis = this.getTopEmojis();
    this.topEmojisSubject.next(topEmojis);
  }

  getTopEmojis(count: number = 2): string[] {
    if (!this.emojiStatsCache) {
      this.loadFromStorage();
    }
    
    return Object.entries(this.emojiStatsCache || {})
      .sort(([, a], [, b]) => b - a)
      .slice(0, count)
      .map(([emoji]) => emoji);
  }
}
