import { BaseTestUnit } from '../base';
import {Store} from '../services/store';
import {Cups} from '../services/cups';
import {NgInject, NgTest} from '../decorators';
import {CupsServer} from '../models';

export class CupsTestCase extends BaseTestUnit {
  @NgInject(Cups) private _service: Cups;
  constructor() {
    super([Store, Cups]);
  }

  @NgTest()
  protected async _testService(){
    await this._service.add(<CupsServer>{url: 'http://url-1', name: 'server-1'});
    await new Promise(resolve => this._service.status$.subscribe(resolve));
    expect(this._service.servers.length).toEqual(1);
  }
}
