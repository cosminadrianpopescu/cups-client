import { BaseTestUnit } from '../base';
import {NgInject, NgTest} from '../decorators';
import {Store} from '../services/store';

class Dummy {
  a: string;
  b: string;
}

export class StoreTest extends BaseTestUnit {
  @NgInject(Store) private _service: Store;

  constructor() {
    super([Store]);
  }

  @NgTest()
  protected async _testService() {
    const model = new Dummy();
    model.a = 'a';
    model.b = 'b';
    await this._service.save('model', model);
    let result = await this._service.load('model', Dummy);
    expect(result instanceof Dummy).toBeTruthy();
    expect((result as Dummy).a).toEqual('a');
    result = await this._service.load('model2', Dummy);
    expect(result).toBeNull();

    const arr: Array<Dummy> = [model, model];
    await this._service.save('arr', arr);
    result = await this._service.load('arr', Dummy);
    expect(Array.isArray(result)).toBeTruthy();
    expect((result as Array<Dummy>).length).toEqual(2);
    (result as Array<Dummy>).forEach(r => expect(r instanceof Dummy).toBeTruthy());
  }
}
