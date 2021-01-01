import {Component, Input, TemplateRef} from '@angular/core';
import {BaseComponent} from '../base';
import {NgCycle} from '../decorators';
import {Observable} from 'rxjs';
import {ListDatasource} from './models';

@Component({
  selector: 'cups-list',
  templateUrl: './list.html',
  styleUrls: ['./list.scss']
})
export class List<T> extends BaseComponent {
  @Input() public dataSource: ListDatasource<T>;
  @Input() public tpl: TemplateRef<any>;

  protected _rows$: Promise<Array<T>> | Observable<Array<T>>;

  @NgCycle('init')
  protected _initMe() {
    this._rows$ = this.dataSource.fetch();
  }
}
