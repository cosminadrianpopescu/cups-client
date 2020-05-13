import {Component} from '@angular/core';
import {BaseComponentWithDispatch} from '../base-dispatch';
import {NgInject, NgCycle} from '../decorators';
import {CupsServer, to} from '../models';
import {Cups} from '../services/cups';

@Component({
  selector: 'servers',
  templateUrl: '../../html/servers.html',
})
export class Servers extends BaseComponentWithDispatch {
  protected _url: string;
  protected _loaded: boolean = false;
  @NgInject(Cups) private _cups: Cups;

  protected _change(ev: CustomEvent) {
    this._url = ev.detail.value;
  }

  protected _keypress(ev: KeyboardEvent) {
    if (ev.key == "Enter") {
      this._add();
    }
  }

  @NgCycle('init')
  protected _initMe() {
    this._loaded = true;
  }

  protected async _add() {
    if (!this._url) {
      await this.alert('You have to provide an url');
      return ;
    }

    let [err] = await to(this._cups.add(<CupsServer>{url: this._url}));
    if (err) {
      console.log(err);
      await this.alert('There has been an error addind the url, please see the logs');
      return ;
    }

    this.navigate('printers');
  }
}
