import {Injectable, Type} from '@angular/core';
import {BaseClass} from '../base';
import {NgInject} from '../decorators';
import {ModelFactory, to} from '../models';
import {FilePicker} from './filepicker';
import {NextcloudCredentials, NextcloudLogin, NextcloudPoll} from './models';
import {Webdav} from './webdav';
import {Filepick, FilepickInstance} from './filepick';
import {take} from 'rxjs/operators';
import { ModalController } from '@ionic/angular';

@Injectable()
export class Nextcloud extends BaseClass {
  @NgInject(ModalController) private _modal: ModalController;
  @NgInject(Webdav) private _webdav: Webdav;

  private _lastPath: string = '/';
  private _credentials: NextcloudCredentials = null;

  constructor() {
    super();
  }

  private async _rest<T>(url: string, options: RequestInit, type: Type<T>): Promise<T> {
    if (!options) {
      options = {};
    }

    options.headers = {'Content-Type': 'application/x-www-form-urlencoded'};
    //options.headers = {'OCS-APIRequest': 'true'};
    const result = await fetch(url, options);
    if (result.status < 200 || result.status >= 300) {
      throw Error(result.statusText);
    }
    const json = await result.json();
    return ModelFactory.instance(json, type) as T;
  }

  private get _isOC(): boolean {
    return window.top && window.top['OC'];
  }

  public setCredentials(credentials: NextcloudCredentials) {
    this._credentials = credentials;
    this._webdav.init(credentials);
  }

  private get _isNcSetup(): boolean {
    return !!this._credentials;
  }

  public get isNextcloud(): boolean {
    return this._isOC || this._isNcSetup;
  }

  private async _processLastPath(x: Array<string>) {
    if (x.length > 0) {
      this._lastPath = x[0].replace(/^(.*)\/[^\/]+$/g, '$1');
    }
  }

  private async _pickFromFrame(): Promise<Array<string>> {
    const picker = new FilePicker('Choose a file', true, [], true, 1, false, this._lastPath);
    const result: Array<string> = await picker.pick() as any;
    await this._processLastPath(result);
    return result;
  }

  private async _pickFromApp(maximized: boolean, type: 'file' | 'directory' = 'file'): Promise<Array<string>> {
    const modal = await this._modal.create({
      component: Filepick, componentProps: {type: type},
    });
    await modal.present();

    return new Promise(resolve => {
      FilepickInstance.instance.choose.pipe(take(1)).subscribe(files => {
        resolve(files.map(f => f.mime + '@' + f.filename));
        modal.dismiss();
      });

      modal.onDidDismiss().then(() => resolve([]));
    });
  }

  public async pickFile(maximized: boolean = false): Promise<Array<string>> {
    if (this._isNcSetup) {
      return this._pickFromApp(maximized);
    }

    return this._pickFromFrame();
  }

  private async _pickFolderOC(): Promise<string> {
    const picker = new FilePicker('Choose a folder', false, ['*.zzz'], true, 1, true, this._lastPath);
    const result: string = await picker.pick();
    await this._processLastPath([result]);
    return result;
  }

  private async _pickFolderNc(maximized: boolean): Promise<string> {
    const result = await this._pickFromApp(maximized, 'directory');
    return result[0];
  }

  public async pickFolder(maximized: boolean = false): Promise<string> {
    if (this._isNcSetup) {
      return this._pickFolderNc(maximized);
    }

    return this._pickFolderOC();
  }

  private async _downloadOC(path: string): Promise<ArrayBuffer> {
    return null;
  }

  private async _downloadApp(path: string): Promise<ArrayBuffer> {
    return this._webdav.download(path);
  }

  public async download(path: string): Promise<ArrayBuffer> {
    if (this._isNcSetup) {
      return this._downloadApp(path);
    }

    return this._downloadOC(path);
  }

  public async upload(path: string, content: Blob): Promise<string> {
    if (this._isNcSetup) {
      await this._webdav.upload(path, content);
      return path;
    }
    return FilePicker.upload(path, content);
  }

  private async _poll(poll: NextcloudPoll, n: number = 0): Promise<NextcloudCredentials> {
    if (n >= 30) {
      throw 'NOT_LOGGED_IN_WITHIN_30_SECONDS';
    }
    const [err, result] = await to(this._rest(poll.endpoint, {method: 'post', body: `token=${poll.token}`}, NextcloudCredentials));

    if (err) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return this._poll(poll, n + 1);
    }

    this.setCredentials(result);

    return result;
  }

  public async login(baseUrl: string): Promise<NextcloudCredentials> {
    const loginData = await this._rest(`${baseUrl}/index.php/login/v2`, {method: 'post'}, NextcloudLogin);
    const a = document.createElement('a');
    a.href = loginData.login;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    return this._poll(loginData.poll);
  }
}
