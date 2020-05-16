import {Injectable} from '@angular/core';
import {NavigationEnd, Router, ActivatedRoute} from '@angular/router';
import {filter} from 'rxjs/operators';
import {BaseClass} from '../base';
import {NgInject} from '../decorators';
import {BehaviorSubject} from 'rxjs';

@Injectable()
export class Navigation extends BaseClass {
  @NgInject(Router) private _router: Router;
  @NgInject(ActivatedRoute) private _route: ActivatedRoute;

  public title$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  constructor() {
    super();
    this._router.events.pipe(filter(ev => ev instanceof NavigationEnd)).subscribe(() => {
      this.title$.next(this._route.root.firstChild.snapshot.data['title']);
    });
  }
}
