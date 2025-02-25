import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { DaBubbleAnimationComponent } from './app/shared/da-bubble-animation/da-bubble-animation.component';
import { provideAnimations } from '@angular/platform-browser/animations';



bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [...(appConfig.providers || []), provideAnimations()]
}).catch((err) => console.error(err));
