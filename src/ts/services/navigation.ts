import {Injectable} from '@angular/core';
import {NavigationEnd, Router, ActivatedRoute} from '@angular/router';
import {filter} from 'rxjs/operators';
import {BaseClass} from '../base';
import {NgInject} from '../decorators';
import {BehaviorSubject} from 'rxjs';

const DEFAULT_TITLE = 'CUPS client'

@Injectable()
export class Navigation extends BaseClass {
  @NgInject(Router) private _router: Router;
  @NgInject(ActivatedRoute) private _route: ActivatedRoute;

  public title$: BehaviorSubject<string> = new BehaviorSubject<string>(DEFAULT_TITLE);

  constructor() {
    super();
    this._router.events.pipe(filter(ev => ev instanceof NavigationEnd)).subscribe(() => {
      this.title$.next(this._route.root.firstChild.snapshot.data['title'] || DEFAULT_TITLE);
    });
  }
}
