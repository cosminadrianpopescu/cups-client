import {Injectable} from '@angular/core';
import {NgInject} from '../decorators';
import {Printer, PrinterOptionsGroup} from '../models';
import {App} from '../services/app';
import {Cups} from '../services/cups';
import {BaseClass} from '../base';
import {ListDatasource} from '../wrappers/models';

@Injectable({providedIn: 'root'})
export class PrinterOptions extends BaseClass implements ListDatasource<PrinterOptionsGroup> {
  @NgInject(Cups) private _cups: Cups;
  private _ppd: Array<PrinterOptionsGroup> = [];
  private _printer: Printer;

  public async fetch(): Promise<PrinterOptionsGroup[]> {
    const ppd = await this._cups.getPpd(App.state.printer);
    this._printer = App.state.printer;
    this._ppd = ppd;

    return [
      {cupsKey: 'file-name', name: App.currentFile},
      <any>{name: null, cupsKey: 'global'},
      {cupsKey: 'separator', name: 'Standard options'},
      ...this._printer.options,
      {name: 'Fit to page', cupsKey: 'fit-to-page', default: false},
      {cupsKey: 'separator', name: 'Advanced options'},
      ...this._ppd,
    ];
  }

  public separatorLabel(row: PrinterOptionsGroup): string {
    if (row.cupsKey != 'separator') {
      return null;
    }
    return row.name;
  }
}
