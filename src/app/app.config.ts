import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideClientHydration(), provideFirebaseApp(() => initializeApp({"projectId":"da-bubble-d9717","appId":"1:48422013104:web:9d6cee125aa7de9314d375","storageBucket":"da-bubble-d9717.firebasestorage.app","apiKey":"AIzaSyBoiDsATim6ZVEcnSs2UFkx7Kti4ExPbHY","authDomain":"da-bubble-d9717.firebaseapp.com","messagingSenderId":"48422013104"})), provideAuth(() => getAuth()), provideFirestore(() => getFirestore())]
};
