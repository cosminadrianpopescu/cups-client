import {Injectable, Type} from '@angular/core';
import {Plugins} from '@capacitor/core';
import {BaseClass} from '../base';
import {CupsServer, ModelFactory} from '../models';
import {NextcloudCredentials} from '../nextcloud/models';

const { Storage } = Plugins;
const SERVER_KEY = 'servers';
const NEXTCLOUD_KEY = 'nc';
const PREVIEW_KEY = 'preview-in-cloud';

@Injectable()
export class Store extends BaseClass {
  public async load<T>(key: string, type?: Type<T>): Promise<T | Array<T>> {
    const result = await Storage.get({key: key});
    if (!result.value) {
      return null;
    }
    return ModelFactory.instance(JSON.parse(result.value).data, type) as T | T[];
  }

  public async save(key: string, data: any): Promise<void> {
    Storage.set({key: key, value: JSON.stringify({data: data, date: new Date()})});
  }

  public async servers(): Promise<CupsServer[]> {
    const result: Array<CupsServer> = await this.load(SERVER_KEY, CupsServer) as CupsServer[];
    return result || [];
  }

  public async setServers(value: Array<CupsServer>) {
    const toSave = value.map(s => <CupsServer>{url: s.url, name: s.name});
    await this.save(SERVER_KEY, toSave);
  }

  public nextcloud(): Promise<NextcloudCredentials> {
    return this.load(NEXTCLOUD_KEY, NextcloudCredentials) as Promise<NextcloudCredentials>;
  }

  public async saveNextcloud(c: NextcloudCredentials) {
    return this.save(NEXTCLOUD_KEY, c);
  }

  public async getPreview(): Promise<boolean> {
    return this.load(PREVIEW_KEY) as Promise<boolean>;
  }

  public async setPreview(value: boolean) {
    return this.save(PREVIEW_KEY, value);
  }
}
