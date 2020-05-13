import {Component, ViewEncapsulation} from '@angular/core';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {Platform} from '@ionic/angular';
import {Observable} from 'rxjs';
import {BaseComponent} from '../base';
import {NgInject} from '../decorators';
import {Navigation} from '../services/navigation';
import {tap} from 'rxjs/operators';


@Component({
  selector: 'app-root',
  templateUrl: '../../html/main.html',
  styleUrls: ['../../assets/scss/main.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class Main extends BaseComponent {
  @NgInject(Navigation) private _nav: Navigation;

  protected _title$: Observable<string>;
  protected _back: boolean = false;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar
  ) {
    super();
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this._title$ = this._nav.title$.pipe(
        tap(() => setTimeout(() => this._back = this.isJobPage)),
      );
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this._back = this.isJobPage;
    });
  }
}
