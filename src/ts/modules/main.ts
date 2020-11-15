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
import {AndroidPermissions} from '@ionic-native/android-permissions/ngx';
import { Settings } from '../pages/settings';
import { Guard } from '../services/guard';
import { PrintOptions } from '../components/print-options';
import {Nextcloud} from '../nextcloud/nextcloud';
import {Webdav} from '../nextcloud/webdav';
import {Filepick} from '../nextcloud/filepick';
import * as pipes from '../pipes';

export function WebIntentFactory(p: Platform) {
  return new (p.is('android') ? WebIntent : MockWebIntent)();
}

@NgModule({
  declarations: [MainPage, Home, Servers, Printers, Job, Accordion, Option, Settings, PrintOptions, Filepick, pipes.HumanFileSize],
  entryComponents: [PrintOptions, Filepick],
  imports: [
    BrowserModule, IonicModule.forRoot(),
    HttpClientModule,
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, useHash: true })
  ],
  providers: [
    StatusBar,
    SplashScreen, Store, AndroidPermissions,
    HTTP, Cups, File, Platform, Navigation, Http, FileChooser, App,
    Guard, Nextcloud, Webdav,
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
