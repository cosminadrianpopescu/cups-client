import {Injectable, Type} from '@angular/core';
import {DialogService, DynamicDialogConfig} from 'primeng/dynamicdialog';
import {BaseClass} from '../base';
import {NgInject} from '../decorators';
import {ModelFactory, to} from '../models';
import {FilePicker} from './filepicker';
import {NextcloudCredentials, NextcloudLogin, NextcloudPoll, NextcloudShare, NextcloudShareResult} from './models';
import {Webdav} from './webdav';
import {Filepick, FilepickInstance} from './filepick';
import {take} from 'rxjs/operators';

@Injectable()
export class Nextcloud extends BaseClass {
  @NgInject(DialogService) private _modal: DialogService;
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

    if (options && !options.headers) {
      options.headers = {'Content-Type': 'application/x-www-form-urlencoded'};
    }
    //options.headers = {'OCS-APIRequest': 'true'};
    const result = await fetch(url, options);
    if (result.status < 200 || result.status >= 300) {
      throw Error(result.statusText);
    }
    const json = await result.json();
    return ModelFactory.instance(json, type) as T;
  }

  public static get isOC(): boolean {
    return window.top && window.top['OC'];
  }

  public set credentials(x: NextcloudCredentials) {
    this._credentials = x;
    this._webdav.init(x);
  }

  public get credentials(): NextcloudCredentials {
    if (this._isNcSetup) {
      return this._credentials;
    }

    return FilePicker.credentials;
  }

  private get _isNcSetup(): boolean {
    return !!this._credentials;
  }

  public get isNextcloud(): boolean {
    return Nextcloud.isOC || this._isNcSetup;
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
    const options: DynamicDialogConfig = {
      modal: true, header: type == 'file' ? 'Choose a file' : 'Choose a directory', closable: true, closeOnEscape: false,
      styleClass: 'content', footer: ' ', 
    }

    if (maximized) {
      options.styleClass = 'p-dialog-maximized';
    }
    else {
      options.style = {'min-width': '600px'};
    }
    const ref = this._modal.open(Filepick, options);

    await new Promise(resolve => setTimeout(resolve));
    FilepickInstance.instance.type =  type;
    return new Promise(resolve => {
      FilepickInstance.instance.choose.pipe(take(1)).subscribe(files => {
        resolve(files.map(f => f.filename));
        ref.close();
      });

      ref.onDestroy.pipe(take(1)).subscribe(() => resolve([]));
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
    const content = await fetch(`${FilePicker.basePath}/${path}`);
    const blob = await content.blob();
    const bin = await blob.arrayBuffer();
    return bin;
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

    this.credentials = result;

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

  public async mkdir(path: string) {
    return await this._webdav.mkdir(path);
  }

  public async exists(path: string): Promise<boolean> {
    if (this._isNcSetup) {
      return this._webdav.exists(path);
    }
    return FilePicker.exists(path);
  }

  private _shareDate(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const m = d.getMonth() + 1;
    const day = d.getDate();

    return `${d.getFullYear()}-${m < 10 ? '0' : ''}${m}-${day < 10 ? '0': ''}${day}`;
  }

  public async share(path: string): Promise<NextcloudShare> {
    const c = this.credentials;
    const params = {path: path, shareType: 3, expireDate: this._shareDate()};
    const options: RequestInit = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'OCS-APIRequest': 'true',
        'Accept': 'application/json, text/plain, */*',
      },
      body: JSON.stringify(params),
    };

    if (this._isNcSetup) {
      options.headers['Authorization'] = `Basic ${btoa(c.loginName + ':' + c.appPassword)}`;
    }
    const result = await this._rest(
      `${c.server}/ocs/v2.php/apps/files_sharing/api/v1/shares`,
      options, NextcloudShareResult,
    );

    return result.ocs.data;
  }

  public async unshare(id: string) {
    const c = this.credentials;
    const options: RequestInit = {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'OCS-APIRequest': 'true',
        'Accept': 'application/json, text/plain, */*',
      }
    }

    if (this._isNcSetup) {
      options.headers['Authorization'] = `Basic ${btoa(c.loginName + ':' + c.appPassword)}`;
    }
    return this._rest(
      `${c.server}/ocs/v2.php/apps/files_sharing/api/v1/shares/${id}`,
      options, Object,
    );
  }

  public static openUrl(url: string, fileName?: string) {
    const a = document.createElement('a');
    if (fileName) {
      a.download = fileName;
    }
    a.target = '_blank';
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  public async preview(data: Blob, fileName?: string) {
    const basePath = '/tmp';
    if (!(await this.exists(basePath))) {
      const [err, ] = await to(this.mkdir(basePath));
      if (err) {
        console.error(basePath);
        throw "COULD_NOT_CREATE_PREVIEW_FOLDER";
      }
    }

    const path = `${basePath}/${fileName || '__for_preview__'}`;
    const [err, ] = await to(this.upload(path, data));
    if (err) {
      console.error('Path is', path);
      throw `ERROR_UPLOADING_FOR_PREVIEW`;
    }

    const [shareErr, share] = await to(this.share(path));
    if (shareErr) {
      console.error(shareErr);
      throw 'ERROR_SHARE';
    }

    setTimeout(() => this.unshare(share.id), 60 * 1000);

    Nextcloud.openUrl(share.url);
  }
}
