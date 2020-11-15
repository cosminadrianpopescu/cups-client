import { Injectable } from '@angular/core';
import {BaseClass} from '../base';
import {createClient} from 'webdav/web';
import {ReplaySubject} from 'rxjs';
import {ModelFactory} from '../models';
import {NextcloudCredentials, NextcloudItem} from './models';
import {take} from 'rxjs/operators';

@Injectable()
export class Webdav extends BaseClass {
  private _client: any = null;
  private _ready$: ReplaySubject<void> = new ReplaySubject(1);

  public async init(credentials: NextcloudCredentials) {
    console.log('init webdav with', credentials);
    if (!credentials) {
      return ;
    }
    this._client = createClient(`${credentials.server}/remote.php/dav/files/${credentials.loginName}`, {
      username: credentials.loginName, password: credentials.appPassword,
    });
    this._ready$.next();
  }

  public async getFiles(path: string): Promise<Array<NextcloudItem>> {
    await new Promise(resolve => this._ready$.pipe(take(1)).subscribe(<any>resolve));
    const result: Array<NextcloudItem> = await this._client.getDirectoryContents(path);
    result.sort((a, b) => {
      if (a.type == b.type) {
        return a.basename.toLowerCase() < b.basename.toLowerCase() ? -1 : 1;
      }

      return a.type == 'directory' ? -1 : 1;
    })
    return ModelFactory.instance(result, NextcloudItem) as Array<NextcloudItem>;
  }

  public download(path: string): Promise<ArrayBuffer> {
    return this._client.getFileContents(path);
  }

  public async upload(path: string, content: Blob): Promise<void> {
    this._client.putFileContents(path, content);
  }
}
