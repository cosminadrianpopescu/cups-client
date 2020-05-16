import {Component, ElementRef, ViewChild} from '@angular/core';
import {IonRefresher, Platform} from '@ionic/angular';
import {Subscription} from 'rxjs';
import {BaseComponent} from '../base';
import {NgCycle, NgInject} from '../decorators';
import {Printer, ServerStatus, to} from '../models';
import {App} from '../services/app';
import {Cups} from '../services/cups';
import {File} from '../services/file';

@Component({
  selector: 'cups-printers',
  templateUrl: '../../html/printers.html',
  styleUrls: ['../../assets/scss/printers.scss'],
})
export class Printers extends BaseComponent {
  @NgInject(Cups) private _cups: Cups;
  @NgInject(File) private _file: File;
  @NgInject(Platform) private _platform: Platform;
  protected _printers: Array<Printer>;
  protected _error: boolean = false;
  protected _subscription: Subscription = null;
  protected _isAndroid: boolean;

  @ViewChild('file', {static: true}) private _f: ElementRef<any>;
  @ViewChild('refresher', {static: true}) private _refresher: IonRefresher;

  constructor() {
    super();
    this._isAndroid = this._platform.is('android');
    if (!this._subscription) {
      this._subscription = this._cups.status$.subscribe(status => {
        this._error = status == ServerStatus.ERROR;
        console.log('error is', this._error);
      });
    }
  }

  @NgCycle('init')
  protected async _initMe() {
    this._printers = this._cups.printers;
  }

  protected async _selected(p: Printer) {
    if (App.isMain) {
      const [err, file] = await to(this._file.choose(this._f.nativeElement));
      if (err) {
        console.error(err);
        await this.alert(err.message);
        return ;
      }
      App.state.intent.clipItems = [{uri: file}];
      App.state.printer = p;
      this.navigate('job');
    }

    if (App.isShare) {
      App.state.printer = p;
      this.navigate('job');
    }
  }

  protected async _default(ev: MouseEvent, p: Printer) {
    await this._cups.setDefault(p);
    this._printers = this._cups.printers;
    ev.stopPropagation();
  }

  protected async _retry() {
    this._error = false;
    await this.showLoading('Retrying server...');
    await this._cups.init();
    await this.hideLoading();
    this._refresher.complete();
  }
}
