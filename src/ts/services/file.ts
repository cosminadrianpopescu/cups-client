import { Injectable } from '@angular/core';
import { BaseClass } from '../base';
import {NgInject} from '../decorators';
import {Platform} from '@ionic/angular';
import {fromEvent} from 'rxjs';
import {take} from 'rxjs/operators';
import {FileChooser} from '@ionic-native/file-chooser/ngx';
import {AndroidPermissions} from '@ionic-native/android-permissions/ngx';
import {to} from '../models';

@Injectable()
export class File extends BaseClass {
  @NgInject(Platform) private _platform: Platform;
  @NgInject(FileChooser) private _chooser: FileChooser;
  @NgInject(AndroidPermissions) private _perm: AndroidPermissions;
  private _file: Blob;

  private async _getPermissions(): Promise<Error> {
    if (!this._platform.is('android')) {
      return ;
    }
    let result = await this._perm.checkPermission(this._perm.PERMISSION.READ_EXTERNAL_STORAGE);
    let err: Error;
    if (!result.hasPermission) {
      [err, result] = await to(this._perm.requestPermission(this._perm.PERMISSION.READ_EXTERNAL_STORAGE));
      if (err) {
        return err;
      }
      
      if (!result.hasPermission) {
        return new Error('NO_PERMISSION');
      }
    }

  }

  private async _read(f: Blob, resolve: Function, reject: Function, mimeTypes?: Array<string>): Promise<void> {
    if (mimeTypes && mimeTypes.indexOf(f.type) == -1) {
      reject(new Error('UNKNOWN_TYPE'));
    }
    const err = await this._getPermissions();
    if (err) {
      reject(err);
    }
    const reader = new FileReader();
    const r: FileReader = reader['__zone_symbol__originalInstance'] || reader;

    r.onloadend = function() {
      resolve(this.result as ArrayBuffer);
    }
    r.onerror = async function() {
      reject(this.error);
    }
    r.readAsArrayBuffer(f);
  }

  public readFile(path: string, mimeTypes?: Array<string>): Promise<ArrayBuffer> {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      if (!this._platform.is('android')) {
        // resolve(new ArrayBuffer(0));
        // return ;
        this._read(this._file, resolve, reject, mimeTypes);
        this._file = null;
        return ;
      }
      window['resolveLocalFileSystemURL'](path, e => {
        e['file']((f: Blob) => {
          this._read(f, resolve, reject, mimeTypes);
        });
      }, err => {
        if (err['code'] && err['code'] == 1) {

        }
        reject(err);
      })
    });
  }

  public async choose(el?: HTMLInputElement): Promise<string> {
    if (this._platform.is('android')) {
      return this._chooser.open();
    }

    el.click();
    return new Promise(resolve => fromEvent(el, 'change').pipe(take(1)).subscribe(() => {
      this._file = el.files[0];
      resolve(el.files[0].name);
      el.value = "";
    }))
  }
}
