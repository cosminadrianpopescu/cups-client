import {Pipe} from '@angular/core';
import {BaseClass} from './base';
import {PrinterOption} from './models';
import {LabelValue} from './wrappers/models';

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

@Pipe({name: 'toOptions'})
export class ToOptions {
  public transform(options: Array<PrinterOption>): Array<LabelValue> {
    if (!Array.isArray(options)) {
      return [];
    }

    return options.map(o => <LabelValue>{label: o.value, value: o.key});
  }
}
