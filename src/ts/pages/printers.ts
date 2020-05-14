import {Component, ViewChild, ElementRef} from '@angular/core';
import {BaseComponentWithDispatch} from '../base-dispatch';
import {NgCycle, NgInject} from '../decorators';
import {Cups} from '../services/cups';
import {Printer, to} from '../models';
import {File} from '../services/file';
import {App} from '../services/app';

@Component({
  selector: 'cups-printers',
  templateUrl: '../../html/printers.html',
  styleUrls: ['../../assets/scss/printers.scss'],
})
export class Printers extends BaseComponentWithDispatch {
  @NgInject(Cups) private _cups: Cups;
  @NgInject(File) private _file: File;
  protected _printers: Array<Printer>;

  @ViewChild('file', {static: true}) private _f: ElementRef<any>;

  @NgCycle('init')
  protected async _initMe() {
    await this.showLoading("Fetching the list of printers")
    this._printers = this._cups.printers;
    await this.hideLoading();
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
}
