import { NgModule, Injector } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy, RouterModule, PreloadAllModules } from '@angular/router';

import {HttpClientModule} from '@angular/common/http';
import { IonicModule, IonicRouteStrategy, Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import {Statics} from '../base';
import {Main as MainPage} from '../pages/main';
import {routes} from '../routing/main';
import {Home} from '../pages/home';
import {Store} from '../services/store';
import {HTTP} from '@ionic-native/http/ngx';
import {Cups} from '../services/cups';
import {WebIntent} from '@ionic-native/web-intent/ngx';
import {File} from '../services/file';
import { Servers } from '../pages/servers';
import {MockWebIntent} from '../tests/mock-intent';
import {Navigation} from '../services/navigation';
import {Http} from '../services/http';
import {Printers} from '../pages/printers';
import {FileChooser} from '@ionic-native/file-chooser/ngx';
import {Job} from '../pages/job';
import { Accordion } from '../components/accordion';
import {Option} from '../components/option';
import { App } from '../services/app';
import {Toast} from '@ionic-native/toast/ngx';

export function WebIntentFactory(p: Platform) {
  return new (p.is('android') ? WebIntent : MockWebIntent)();
}

@NgModule({
  declarations: [MainPage, Home, Servers, Printers, Job, Accordion, Option],
  entryComponents: [],
  imports: [
    BrowserModule, IonicModule.forRoot(),
    HttpClientModule,
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, useHash: true })
  ],
  providers: [
    StatusBar,
    SplashScreen, Store, 
    HTTP, Cups, File, Platform, Navigation, Http, FileChooser, App,
    Toast, 
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {provide: WebIntent, useFactory: WebIntentFactory, deps: [Platform]},
  ],
  bootstrap: [MainPage]
})
export class Main {
  constructor(inj: Injector) {
    Statics.injector = inj;
  }
}
