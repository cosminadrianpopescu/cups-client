import {Component} from '@angular/core';
import {BaseComponent} from '../base';
import {NgCycle, NgInject} from '../decorators';
import {Store} from '../services/store';
import {Cups} from '../services/cups';
import {CupsServer} from '../models';

@Component({
  selector: 'cups-settings',
  templateUrl: '../../html/settings.html'
})
export class Settings extends BaseComponent {
  protected _url: string = '';
  @NgInject(Store) private _store: Store;
  @NgInject(Cups) private _cups: Cups;

  @NgCycle('init')
  protected async _initMe() {
    const servers = await this._store.servers();
    if (servers.length == 1) {
      this._url = servers[0].url;
    }
  }

  protected async _save() {
    await this._cups.updateCurrent(<CupsServer>{url: this._url});
    this.navigate('printers');
  }
}
