import {Injectable} from '@angular/core';
import {MessageService} from 'primeng/api';

@Injectable({providedIn: 'root'})
export class Messages {
  constructor(private _messaging: MessageService) {}

  public toast(msg: string) {
    this._messaging.add({key: 'abc', severity: 'success', sticky: false, detail: msg, life: 3000});
  }
}
