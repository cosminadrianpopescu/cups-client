import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { environment } from './environments/environment';
import {Main} from './ts/modules/main';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(Main)
  .catch(err => console.log(err));
