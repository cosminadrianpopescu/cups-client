import {Directive, ElementRef, Output, EventEmitter, NgZone} from '@angular/core';
import {BaseComponent} from '../base';
import {NgCycle, NgInject} from '../decorators';
import * as PullToRefresh from 'pulltorefreshjs';
import {PullToRefreshInstance} from 'pulltorefreshjs';

@Directive({
  selector: '[pull-refresh]',
})
export class PullRefresh extends BaseComponent {
  @Output() public refreshNotify: EventEmitter<PullToRefreshInstance> = new EventEmitter<PullToRefreshInstance>();

  @NgInject(NgZone) private _zone: NgZone;
  private _refresher: PullToRefreshInstance;
  constructor(private _el: ElementRef<any>) {
    super();
  }

  @NgCycle('init')
  protected _initMe() {
    if (this._refresher) {
      return ;
    }
    this._refresher = PullToRefresh.init({
      mainElement: this._el.nativeElement,
      onRefresh: () => new Promise(resolve => {
        this._zone.run(() => {
          this.refreshNotify.emit(this._refresher);
          resolve();
        });
      }),
      refreshTimeout: 0,
    });
  }

  @NgCycle('destroy')
  protected _destroy() {
    if (!this._refresher) {
      return ;
    }
    this._refresher.destroy();
  }
}
