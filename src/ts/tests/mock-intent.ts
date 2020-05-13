import {Intent} from '@ionic-native/web-intent/ngx';
import {BehaviorSubject} from 'rxjs';

export class MockWebIntent {
  protected static _i1: Intent = {
    clipItems: [],
    type: '',
    flags: 0,
    extras: {profile: 0},
    action: 'android.intent.action.MAIN',
    component: 'ComponentInfo{io.ionic.starter/io.ionic.starter.MainActivity}'
  }

  protected static _i2: Intent = {
    clipItems: [{
      type: 'application/pdf',
      uri: 'content://org.nextcloud.fil^C/external_files/emulated/0/nextcloud/cosmin%40cloud.taid.be/test-printing.pdf',
      extension: 'pdf',
    }],
    type: 'application/pdf',
    extras: {},
    action: 'android.intent.action.SEND',
    component: 'ComponentInfo{io.ionic.starter/io.ionic.starter.MainActivity}',
    flags: 0,
  }

  private _intent$: BehaviorSubject<Intent> = new BehaviorSubject<Intent>(MockWebIntent._i1);

  public onIntent() {
    return this._intent$;
  }

  constructor() {
    window['MockWebIntent'] = this;
  }

  public next() {
    this._intent$.next(MockWebIntent._i2);
  }
}
