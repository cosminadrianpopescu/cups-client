import {WebIntent} from '@ionic-native/web-intent/ngx';
import {combineLatest} from 'rxjs';
import {BaseComponent} from './base';
import {NgInject, NgCycle} from './decorators';
import {ServerStatus} from './models';
import {Cups} from './services/cups';
import {App} from './services/app';

export class BaseComponentWithDispatch extends BaseComponent {
  @NgInject(WebIntent) private __intent__: WebIntent;
  @NgInject(Cups) private __cups__: Cups;

  private __isDispatcher__ = true;

  private dispatch(result: boolean, resolve: Function) {
    resolve(result);
    App.dispatchDone$.next(true);
  }

  protected async _handleError(err: Error) {
    await this.hideLoading();
    console.error(err);
    await this.alert(err.message || err['error'] || err.name || err.constructor.name);
  }

  protected async __doDispatch__(): Promise<boolean> {
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
          this.dispatch(true, resolve);
          return ;
        }
        App.state.status = status;
        App.state.intent = intent;
        await this.hideLoading();
        if (App.state.status == ServerStatus.NO_SERVER && !this._router.url.match(/servers$/g)) {
          console.log('we got no servers');
          this.navigate('servers');
          this.dispatch(true, resolve);
          return ;
        }

        if (App.state.status == ServerStatus.READY) {
          this.dispatch(!this._router.url.match(/printers$/), resolve);
          const d = this.__cups__.printers.find(p => p.default);
          if (App.isShare && d) {
            App.state.printer = d;
            this._router.navigateByUrl('printers', {skipLocationChange: true}).then(() => this.navigate('job'));
            // this.navigate('job');
            return ;
          }
          this.navigate('printers');
          return ;
        }

        if (this._router.url.match(/job$/) && App.state.intent.clipItems.length == 0) {
          this.dispatch(true, resolve);
          this.navigate('printers');
          return ;
        }

        this.dispatch(false, resolve);
      });
    });
  }
}
