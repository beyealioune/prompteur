import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { routes } from './app.routes';

import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptor/jwt.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';

import { IonicModule } from '@ionic/angular';
import { provideRouter } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(), 
    importProvidersFrom(IonicModule.forRoot()) // ✅ Garde uniquement ça pour Ionic
  ]
};


