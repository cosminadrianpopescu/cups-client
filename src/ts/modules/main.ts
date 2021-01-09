import {HttpClientModule} from '@angular/common/http';
import {Injector, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {PreloadAllModules, RouterModule} from '@angular/router';
import {AndroidPermissions} from '@ionic-native/android-permissions/ngx';
import {FileChooser} from '@ionic-native/file-chooser/ngx';
import {HTTP} from '@ionic-native/http/ngx';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {Toast} from '@ionic-native/toast/ngx';
import {WebIntent} from '@ionic-native/web-intent/ngx';
import {IonicModule, Platform} from '@ionic/angular';
import {SidebarModule} from 'primeng/sidebar';
import {ToolbarModule} from 'primeng/toolbar';
import {Spinner, Statics} from '../base';
import {Accordion} from '../components/accordion';
import {Loading} from '../components/loading';
import {Option} from '../components/option';
import {NextcloudModule} from '../nextcloud/module';
import {Nextcloud} from '../nextcloud/nextcloud';
import {Webdav} from '../nextcloud/webdav';
import {Home} from '../pages/home';
import {Job} from '../pages/job';
import {Main as MainPage} from '../pages/main';
import {Printers} from '../pages/printers';
import {Servers} from '../pages/servers';
import {Settings} from '../pages/settings';
import * as pipes from '../pipes';
import {routes} from '../routing/main';
import {App} from '../services/app';
import {Cups} from '../services/cups';
import {File} from '../services/file';
import {Guard} from '../services/guard';
import {Http} from '../services/http';
import {Navigation} from '../services/navigation';
import {Store} from '../services/store';
import {MockWebIntent} from '../tests/mock-intent';
import {PrimengWrappers} from '../wrappers/module';

export function WebIntentFactory(p: Platform) {
  return new (p.is('android') ? WebIntent : MockWebIntent)();
}

// if (FileReader['__zone_symbol__OriginalDelegate']) {
//   FileReader = FileReader['__zone_symbol__OriginalDelegate'];
// }

window['NgFileReader'] = FileReader;

export class FileReaderA extends FileReader {
  constructor() {
    super();
    const orig = (this as any)['_realReader'];
    return orig || this;
  }
}

window.FileReader = FileReaderA;


@NgModule({
  declarations: [
    MainPage, Home, Servers, Printers, Job, Accordion, Option,
    Settings, pipes.HumanFileSize, Loading, pipes.ToOptions,
  ],
  entryComponents: [Loading],
  imports: [
    BrowserModule, IonicModule.forRoot(),
    HttpClientModule,
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, useHash: true }),
    SidebarModule, ToolbarModule, 
    BrowserAnimationsModule, NextcloudModule, PrimengWrappers,
  ],
  providers: [
    StatusBar,
    SplashScreen, Store, AndroidPermissions,
    HTTP, Cups, File, Platform, Navigation, Http, FileChooser, App,
    Guard, Nextcloud, Webdav,
    {provide: WebIntent, useFactory: WebIntentFactory, deps: [Platform]},
    Toast, Spinner, 
  ],
  bootstrap: [MainPage]
})
export class Main {
  constructor(inj: Injector) {
    Statics.injector = inj;
  }
}
