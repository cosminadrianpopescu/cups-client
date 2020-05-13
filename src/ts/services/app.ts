import {Injectable} from '@angular/core';
import {Intent} from '@ionic-native/web-intent/ngx';
import {BaseClass} from '../base';
import {AppState} from '../models';

@Injectable()
export class App extends BaseClass {
  public static state: AppState = {
    intent: null,
    status: null,
    printer: null,
    error: null,
  };

  public static get isMain(): boolean {
    return App.state.intent.action.match(/MAIN$/g) ? true : false;
  }

  public static get isShare(): boolean {
    return App.state.intent.action.match(/SEND(_MULTIPLE)?$/) ? true : false;
  }

  private static _arrayCompare(a1: Array<string>, a2: Array<string>): boolean {
    if (!Array.isArray(a1) || !Array.isArray(a2)) {
      return false;
    }

    return a1.reduce((acc, v) => {
      if (!acc) {
        return false;
      }

      return a2.indexOf(v) !== -1;
    }, true);
  }

  public static equals(i1: Intent, i2: Intent) {
    console.log('compare', i1, i2);
    if (!i1 || !i2) {
      return false;
    }
    return i1.action == i2.action && i1.type == i2.type
      && i1.flags == i2.flags && this._arrayCompare(i1.clipItems.map(i => i.uri), i2.clipItems.map(i => i.uri))
      && i1.component == i2.component;
  }
}
