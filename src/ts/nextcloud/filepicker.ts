/// <reference types="@nextcloud/typings" />

import {to} from '../models';
import {NextcloudCredentials} from './models';

declare var OC: Nextcloud.v16.OC | Nextcloud.v17.OC | Nextcloud.v18.OC | Nextcloud.v19.OC;

if (window.top && window.top['OC']) {
  window['OC'] = window.top['OC'];
}

export enum FilePickerType {
  Choose = 1,
    Move = 2,
    Copy = 3,
    CopyMove = 4,
}

export class FilePicker {
  private title: string
  private multiSelect: boolean
  private mimeTypeFiler: string[]
  private modal: boolean
  private type: FilePickerType
  private directoriesAllowed: boolean
  private path?: string

  public constructor(title: string,
    multiSelect: boolean,
    mimeTypeFilter: string[],
    modal: boolean,
    type: FilePickerType,
    directoriesAllowed: boolean,
    path?: string) {
    this.title = title
    this.multiSelect = multiSelect
    this.mimeTypeFiler = mimeTypeFilter
    this.modal = modal
    this.type = type
    this.directoriesAllowed = directoriesAllowed
    this.path = path
  }

  public pick(): Promise<string> {
    return new Promise((res, rej) => {
      OC.dialogs.filepicker(
        this.title,
        res,
        this.multiSelect,
        this.mimeTypeFiler,
        this.modal,
        this.type,
        this.path,
        {
          allowDirectoryChooser: this.directoriesAllowed
        }
      )
    })
  }

  public static download(path: string): Promise<any> {
    return new Promise<any>(resolve => {
      OC['Files'].getClient().getFileContents(path).then((code, content) => {
        resolve(content);
      });
    });
  }

  public static get credentials(): NextcloudCredentials {
    const result = new NextcloudCredentials();
    result.appPassword = OC['requestToken'];
    result.loginName = OC['currentUser'];
    result.server = window.location.origin;
    return result;
  }

  public static get basePath(): string {
    return OC['Files'].getClient().getBaseUrl();
  }

  private static async _getPath(path: string): Promise<string> {
    const [err] = await to(OC['Files'].getClient().getFileInfo(path));

    if (err) {
      return path;
    }

    const p = /^(.*)\.([^\.]+)$/;
    let name = path.replace(p, '$1');
    const ext = name == path ? '' : path.replace(p, '$2');

    const p2 = /^(.*)-([0-9]+)$/;
    let idx: string | number = name.replace(p2, '$2');
    if (idx == name) {
      idx = 1;
    }
    else {
      idx = parseInt(idx) + 1;
    }
    name = `${name.replace(p2, '$1')}-${idx.toString()}`;

    return FilePicker._getPath(name + (ext == '' ? '' : '.' + ext));
  }

  public static async upload(path: string, content: Blob): Promise<string> {
    const _path = await FilePicker._getPath(path);
    await OC['Files'].getClient().putFileContents(_path, content);
    return _path;
  }

  public static async exists(path: string): Promise<boolean> {
    return new Promise(resolve => OC['Files'].getClient().getFileInfo(path).then(() => resolve(true)).fail(() => resolve(false)));
  }
}

export class FilePickerBuilder {
  private title: string
  private multiSelect: boolean = false
  private mimeTypeFiler: string[] = []
  private modal: boolean = true
  private type: FilePickerType = FilePickerType.Choose
  private directoriesAllowed: boolean = false
  private path?: string

  public constructor(title: string) {
    this.title = title
  }

  public setMultiSelect(ms: boolean): FilePickerBuilder {
    this.multiSelect = ms
    return this
  }

  public addMimeTypeFilter(filter: string): FilePickerBuilder {
    this.mimeTypeFiler.push(filter)
    return this
  }

  public setMimeTypeFilter(filter: string[]): FilePickerBuilder {
    this.mimeTypeFiler = filter
    return this
  }

  public setModal(modal: boolean): FilePickerBuilder {
    this.modal = modal
    return this
  }

  public setType(type: FilePickerType): FilePickerBuilder {
    this.type = type
    return this
  }

  public allowDirectories(allow: boolean = true): FilePickerBuilder {
    this.directoriesAllowed = allow
    return this
  }

  public startAt(path: string): FilePickerBuilder {
    this.path = path
    return this
  }

  public build(): FilePicker {
    return new FilePicker(
      this.title,
      this.multiSelect,
      this.mimeTypeFiler,
      this.modal,
      this.type,
      this.directoriesAllowed,
      this.path
    )
  }

}

export function getFilePickerBuilder(title: string): FilePickerBuilder {
  return new FilePickerBuilder(title)
}
