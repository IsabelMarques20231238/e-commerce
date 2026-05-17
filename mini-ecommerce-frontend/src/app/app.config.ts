import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth-interceptor';
// Se ainda não criaste o ficheiro do interceptor, podes comentar a linha abaixo com //

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor]),
      // Se der erro no authInterceptor, apaga a linha abaixo até o criares
    ),
    provideClientHydration(withEventReplay())
  ]
};
