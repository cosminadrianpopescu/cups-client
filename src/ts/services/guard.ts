import { Injectable } from '@angular/core';
import { BaseClass } from '../base';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {App} from './app';
import {map, tap} from 'rxjs/operators';

@Injectable()
export class Guard extends BaseClass implements CanActivate {
  public canActivate(_snapshot: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<boolean> {
    return App.dispatchDone$.pipe(map(() => true), tap(result => console.log('we got navigation', result)));
  }
}
