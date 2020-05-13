import { Injectable, Type } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { BaseClass } from '../base';
import {ModelFactory} from '../models';

const { Storage } = Plugins;

@Injectable()
export class Store extends BaseClass {
  public async load<T>(key: string, type: Type<T>): Promise<T | Array<T>> {
    const result = await Storage.get({key: key});
    if (!result.value) {
      return null;
    }
    return ModelFactory.instance(JSON.parse(result.value).data, type);
  }

  public async save(key: string, data: any): Promise<void> {
    Storage.set({key: key, value: JSON.stringify({data: data, date: new Date()})});
  }
}
