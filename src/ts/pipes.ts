import {BaseClass} from './base';
import {Pipe} from '@angular/core';

@Pipe({name: 'humanFileSize'})
export class HumanFileSize extends BaseClass {
  public transform(size: number): string {
    if (!size) {
      return '';
    }
    const i = Math.floor( Math.log(size) / Math.log(1024) );
    return ( size / Math.pow(1024, i) ).toFixed(2) + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
  }
}
