import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { isDevMode } from '@angular/core';

import { AppModule } from './app/app.module';

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));

// 👇 Añade aquí tu código del Service Worker manual
if ('serviceWorker' in navigator && !isDevMode()) {
  navigator.serviceWorker.register('ngsw-worker.js')
    .then((registration) => {
      console.log('Service Worker registrado:', registration);
    })
    .catch((error) => {
      console.error('Error al registrar el Service Worker:', error);
    });
} else {
  console.log('Modo desarrollo, no se registra el Service Worker');
}
