import {Component} from '@angular/core';
import {BaseComponent} from '../base';
import {NgCycle, NgInject} from '../decorators';
import {CupsServer} from '../models';
import {NextcloudCredentials} from '../nextcloud/models';
import {Nextcloud} from '../nextcloud/nextcloud';
import {Cups} from '../services/cups';
import {Store} from '../services/store';

@Component({
  selector: 'cups-settings',
  templateUrl: '../../html/settings.html',
  styleUrls: ['../../assets/scss/settings.scss'],
})
export class Settings extends BaseComponent {
  protected _url: string = '';
  protected _ncCredentials: NextcloudCredentials = null;
  protected _previewInCloud: boolean = false;
  @NgInject(Store) private _store: Store;
  @NgInject(Cups) private _cups: Cups;
  @NgInject(Nextcloud) private _nc: Nextcloud;

  @NgCycle('init')
  protected async _initMe() {
    const servers = await this._store.servers();
    this._previewInCloud = await this._store.getPreview();
    console.log('preview is', this._previewInCloud);
    if (servers.length == 1) {
      this._url = servers[0].url;
    }
    this._ncCredentials = await this._store.nextcloud();
    if (!this._ncCredentials) {
      this._ncCredentials = new NextcloudCredentials();
    }
  }

  protected async _save() {
    await this._cups.updateCurrent(<CupsServer>{url: this._url});
    await this._store.setPreview(this._previewInCloud);
    this.navigate('printers');
  }

  protected async _ncLogin() {
    this.showLoading("Waiting to perform login");
    let err = null;
    let result = null;
    try {
      result = await this._nc.login(this._ncCredentials.server);
    }
    catch (_err) {
      err = _err
    }
    this.hideLoading();
    const msg = err ? err.message : 'You have been authenticated with nextcloud';
    this.alert(msg);
    if (result) {
      await this._store.saveNextcloud(result);
    }
  }
}
