import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { DaBubbleAnimationComponent } from './app/shared/da-bubble-animation/da-bubble-animation.component';
import { provideAnimations } from '@angular/platform-browser/animations';


// Animationseinstellungen vor dem Bootstrap der Anwendung
const animationPlayed = localStorage.getItem('animationPlayed');
if (!animationPlayed) {
  localStorage.setItem('animationPlayed', 'true');
  setTimeout(() => {
    localStorage.removeItem('animationPlayed');
  }, 4000);
}

// Sicherstellen, dass der Event-Listener immer hinzugefügt wird
window.addEventListener('beforeunload', () => {
  localStorage.removeItem('animationPlayed');
});


bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [...(appConfig.providers || []), provideAnimations()]
}).catch((err) => console.error(err));
