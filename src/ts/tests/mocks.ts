import { Plugins } from '@capacitor/core';

type ParamsType = {key: string, value?: any};

class MockStorage {
  private _map: Map<string, any> = new Map<string, any>();

  public get(params: ParamsType): Promise<any> {
    return new Promise(resolve => resolve({value: this._map.get(params.key) || null}));
  }

  public set(params: ParamsType): Promise<void> {
    return new Promise(resolve => {
      this._map.set(params.key, params.value);
      resolve();
    });
  }

  public remove(params: ParamsType): Promise<void> {
    return new Promise(resolve => {
      this._map.delete(params.key);
      resolve();
    })
  }
}

export function initMocks() {
  Plugins.Storage = <any>(new MockStorage());
}
