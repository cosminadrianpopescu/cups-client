import {Component, ElementRef, ViewChild} from '@angular/core';
import {IonRefresher, Platform, PopoverController} from '@ionic/angular';
import {Subscription} from 'rxjs';
import {BaseComponent} from '../base';
import {NgCycle, NgInject} from '../decorators';
import {Printer, ServerStatus, to} from '../models';
import {App} from '../services/app';
import {Cups} from '../services/cups';
import {File} from '../services/file';
import {PrintOptions} from '../components/print-options';
import {Nextcloud} from '../nextcloud/nextcloud';
import {Store} from '../services/store';

@Component({
  selector: 'cups-printers',
  templateUrl: '../../html/printers.html',
  styleUrls: ['../../assets/scss/printers.scss'],
})
export class Printers extends BaseComponent {
  @NgInject(Cups) private _cups: Cups;
  @NgInject(File) private _file: File;
  @NgInject(Platform) private _platform: Platform;
  @NgInject(PopoverController) private _modal: PopoverController;
  @NgInject(Nextcloud) private _nc: Nextcloud;
  @NgInject(Store) private _store: Store;
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

  private async _doPrint(p: Printer, from: 'local' | 'cloud') {
    const [err, file] = await to(this._file.choose(from == 'local' ? this._f.nativeElement : 'nc'));
    if (err) {
      console.error(err);
      await this.alert(err.message);
      return ;
    }
    App.state.intent.clipItems = [{uri: file}];
    App.state.printer = p;
    this.navigate('job');
  }

  protected async _selected(p: Printer, ev: MouseEvent) {
    if (App.isShare) {
      App.state.printer = p;
      this.navigate('job');
      return ;
    }
    const nc = await this._store.nextcloud();
    if (!nc) {
      this._doPrint(p, 'local');
      return ;
    }
    this._nc.setCredentials(nc);
    const f = this._doPrint.bind(this);
    const popover = await this._modal.create({
      component: PrintOptions,
      componentProps: {callback: (where) => {
        f(p, where);
        popover.dismiss();
      }},
      event: ev,
    });
    return popover.present();
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
