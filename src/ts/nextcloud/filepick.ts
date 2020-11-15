import {Component, EventEmitter, Input, Output, ViewEncapsulation} from '@angular/core';
import {BaseComponent} from '../base';
import {NgCycle, NgInject} from '../decorators';
import {NextcloudItem, TreeNode} from './models';
import {NextcloudUtils} from './utils';
import {Webdav} from './webdav';

export class FilepickInstance {
  public static instance: Filepick;
}

@Component({
  selector: 'nc-filepick',
  templateUrl: './filepick.html',
  styleUrls: ['./filepick.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class Filepick extends BaseComponent {
  @Input() public path: string = '/';
  @Input() public type: 'file' | 'directory' = 'file';

  @Output() public choose: EventEmitter<Array<NextcloudItem>> = new EventEmitter<Array<NextcloudItem>>();
  @NgInject(Webdav) private _webdav: Webdav;
  protected _files: Array<TreeNode> = [];
  protected _selection: Array<TreeNode> = [];

  constructor() {
    super();
    FilepickInstance.instance = this;
  }

  @NgCycle('init')
  protected _initMe() {
    this._load();
  }

  private _results(files: Array<NextcloudItem>): Array<TreeNode> {
    const result = files.map(f => NextcloudUtils.toTreeNode(f, this.type == 'file'));
    if (this.type == 'file') {
      return result;
    }

    return result.filter(f => !f.leaf);
  }

  protected async _load(node?: TreeNode) {
    const path = node ? (node.data as NextcloudItem).filename : this.path;
    this.showLoading('Reading from cloud');
    const result = await this._webdav.getFiles(path);
    this._files = path && path != '/' ? [NextcloudUtils.parentFolder(path)] : [];
    this._files.push(...this._results(result));
    this.hideLoading();
  }

  protected _select(i: TreeNode, ev: MouseEvent) {
    if (i.data.type == 'directory') {
      this._load(i);
      return ;
    }

    if (!ev.ctrlKey) {
      this._files.forEach(f => f.partialSelected = false);
      this._selection = [];
    }

    i.partialSelected = true;
    this._selection.push(i);
  }

  protected _choose() {
    // const selection = this._selection ? (Array.isArray(this._selection) ? this._selection : [this._selection]) : [];
    // this.choose.emit(selection.map((n: TreeNode) => n.data).filter((f: NextcloudItem) => f.type == this.type));
    this.choose.emit(this._selection.map(n => n.data));
  }
}
