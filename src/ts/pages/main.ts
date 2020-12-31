import {Component} from '@angular/core';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {WebIntent} from '@ionic-native/web-intent/ngx';
import {Platform} from '@ionic/angular';
import {combineLatest, Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {BaseComponent} from '../base';
import {NgInject} from '../decorators';
import {ServerStatus} from '../models';
import {App} from '../services/app';
import {Cups} from '../services/cups';
import {Navigation} from '../services/navigation';


@Component({
  selector: 'app-root',
  templateUrl: '../../html/main.html',
  styleUrls: ['../../assets/scss/main.scss'],
})
export class Main extends BaseComponent {
  @NgInject(Navigation) private _nav: Navigation;
  @NgInject(WebIntent) private __intent__: WebIntent;
  @NgInject(Cups) private __cups__: Cups;

  protected _title$: Observable<string>;
  protected _back: boolean = false;
  protected _sidebar: boolean = false;

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
      this.beginDispatch();
      this._title$ = this._nav.title$.pipe(
        tap(() => setTimeout(() => this._back = this.isJobPage)),
      );
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this._back = this.isJobPage;
    });
  }

  private finishDispatch(result: boolean, resolve: Function) {
    console.log('finish dispatch');
    resolve(result);
    App.dispatchDone$.next(true);
  }

  protected _button(url: string) {
    this._sidebar = false;
    this.navigate(url);
  }

  private async beginDispatch(): Promise<boolean> {
    if (App.state.status) {
      return ;
    }
    console.log('begin dispatch');
    await this.showLoading("Connecting to server");
    return new Promise(resolve => {
      combineLatest(
        this.__intent__.onIntent(),
        this.__cups__.status$,
      ).subscribe(async ([intent, status]) => {
        console.log('data is', intent, status);
        if (status == ServerStatus.ERROR) {
          this._handleError(App.state.error);
          this.finishDispatch(true, resolve);
          return ;
        }
        App.state.status = status;
        App.state.intent = intent;
        await this.hideLoading();
        if (App.state.status == ServerStatus.NO_SERVER && !this._router.url.match(/servers$/g)) {
          await this.navigate('servers');
          this.finishDispatch(true, resolve);
          return ;
        }

        if (App.state.status == ServerStatus.READY) {
          const d = this.__cups__.printers.find(p => p.default);
          let dest = 'printers';
          if (App.isShare && d) {
            App.state.printer = d;
            dest = 'job';
          }
          this.navigate(dest);
          this.finishDispatch(true, resolve);
          return ;
        }

        if (this._router.url.match(/job$/) && App.state.intent.clipItems.length == 0) {
          await this.navigate('printers');
          this.finishDispatch(true, resolve);
          return ;
        }

        this.finishDispatch(false, resolve);
      });
    });
  }
}
