import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { config } from './app/app.config.server';
import { registerLocaleData } from '@angular/common';
import localePtAo from '@angular/common/locales/pt-AO';

registerLocaleData(localePtAo);

const bootstrap = (context: BootstrapContext) =>
    bootstrapApplication(App, config, context);

export default bootstrap;
