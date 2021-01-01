import {Printer} from '../models';
import {Observable, of} from 'rxjs';
import {BaseClass} from '../base';
import {NgInject} from '../decorators';
import {Cups} from '../services/cups';
import {Injectable} from '@angular/core';
import {ListDatasource} from '../wrappers/models';

@Injectable({providedIn: 'root'})
export class Printers extends BaseClass implements ListDatasource<Printer> {
  @NgInject(Cups) private _cups: Cups;
  public fetch(): Observable<Array<Printer>> {
    return of(this._cups.printers);
  }
}
