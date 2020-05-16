import {Component, ViewEncapsulation} from '@angular/core';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {Platform} from '@ionic/angular';
import {Observable, combineLatest} from 'rxjs';
import {BaseComponent} from '../base';
import {NgInject} from '../decorators';
import {Navigation} from '../services/navigation';
import {tap} from 'rxjs/operators';
import {App} from '../services/app';
import {WebIntent} from '@ionic-native/web-intent/ngx';
import {Cups} from '../services/cups';
import {ServerStatus} from '../models';


@Component({
  selector: 'app-root',
  templateUrl: '../../html/main.html',
  styleUrls: ['../../assets/scss/main.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class Main extends BaseComponent {
  @NgInject(Navigation) private _nav: Navigation;
  @NgInject(WebIntent) private __intent__: WebIntent;
  @NgInject(Cups) private __cups__: Cups;

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
    resolve(result);
    App.dispatchDone$.next(true);
  }

  private async beginDispatch(): Promise<boolean> {
    if (App.state.status) {
      return ;
    }
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
            await this._router.navigateByUrl('printers', {skipLocationChange: true});
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
