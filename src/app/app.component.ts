import { Component } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frontend';

   constructor(private swUpdate: SwUpdate) {
    if (swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.subscribe(async event => {
        if (event.type === 'VERSION_READY') {
          const doUpdate = confirm('Hay una nueva versión disponible. Actualizar?');
          if (doUpdate) {
            await this.swUpdate.activateUpdate();
            document.location.reload();
          }
        }
      });
    }
  }
}
