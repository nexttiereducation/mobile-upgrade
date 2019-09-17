import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import * as apexcharts from 'apexcharts';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// Call the element loader after the platform has been bootstrapped
if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .then(() => {
    console.log(apexcharts);
    defineCustomElements(window);
  })
  .catch(err => console.log(err));
