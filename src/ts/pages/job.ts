import {Component} from '@angular/core';
import {BaseComponent} from '../base';
import {NgCycle, NgInject} from '../decorators';
import {Printer, PrinterOptionsGroup, to} from '../models';
import {App} from '../services/app';
import {Cups} from '../services/cups';
import {File} from '../services/file';
import {Navigation} from '../services/navigation';

@Component({
  selector: 'cups-job',
  templateUrl: '../../html/job.html',
  styleUrls: ['../../assets/scss/job.scss']
})
export class Job extends BaseComponent {
  @NgInject(Cups) private _cups: Cups;
  @NgInject(File) private _file: File;
  @NgInject(Navigation) private _nav: Navigation;

  protected _advanced: boolean = false;
  protected _printer: Printer;
  private _f: ArrayBuffer;
  private _jobName: string;
  protected _pages: string;
  protected _copies: number = 1;
  protected _fit: boolean;
  protected _ppd: Array<PrinterOptionsGroup> = [];

  @NgCycle('init')
  protected async _initMe() {
    const intent = App.state.intent;
    await this.showLoading('Retrieving printer options');
    const path = intent.clipItems[0].uri;
    this._jobName = path.replace(/^.*\/([^\/]+)$/, '$1');
    const [err1, mimes] = await to(this._cups.getMimeTypes(App.state.printer));
    if (err1) {
      return this._handleError(err1);
    }
    const [err3, file] = await to(this._file.readFile(path, mimes));
    this._f = file;
    if (err3) {
      this._handleError(err3);
      this.navigate('printers');
    }
    const [err2, ppd] = await to(this._cups.getPpd(App.state.printer));
    if (err2) {
      return this._handleError(err2);
    }
    await this.hideLoading();
    this._printer = App.state.printer;
    this._ppd = ppd;
    this._nav.title$.next(App.state.printer.name);
  }

  protected _select(ev: CustomEvent, group: PrinterOptionsGroup) {
    group.selected = ev.detail.value;
  }

  protected async _print() {
    if (!this._cups.validatePages(this._pages)) {
      await this.alert('The page ranges are not valid');
      return ;
    }
    await this.showLoading('Printing...');
    const [err, result] = await to(this._cups.print(this._jobName, this._f, this._ppd, this._pages, this._copies, this._fit));
    await this.hideLoading();
    if (err) {
      this._handleError(err);
      this.navigate('printers');
      return ;
    }
    await this.alert(result['statusCode']);
    if (App.isMain) {
      this.navigate('printers');
    }
    else if (App.isShare) {
      window['cordova'].plugins['exit']();
    }
  }
}
