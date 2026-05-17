import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { registerLocaleData } from '@angular/common';
import localePtAo from '@angular/common/locales/pt-AO';

registerLocaleData(localePtAo);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
