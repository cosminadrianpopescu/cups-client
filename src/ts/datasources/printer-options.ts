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
      <any>{name: null, cupsKey: null},
      {cupsKey: null, name: 'Standard options'},
      ...this._printer.options,
      {cupsKey: null, name: 'Advanced options'},
      ...this._ppd,
    ];
  }

  public separatorLabel(row: PrinterOptionsGroup): string {
    if (row.cupsKey || !row.name) {
      return null;
    }
    return row.name;
  }
}
