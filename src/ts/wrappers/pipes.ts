import {Pipe} from '@angular/core';
import {ListDatasource, LabelValue} from './models';

@Pipe({name: 'isSeparator'})
export class IsSeparator<T> {
  public transform(row: T, ds: ListDatasource<T>): string {
    if (!ds.separatorLabel) {
      return null;
    }

    return ds.separatorLabel(row);
  }
}

@Pipe({name: 'sorted'})
export class Sorted {
  public transform(options: Array<LabelValue>): Array<LabelValue> {
    return [...options].sort((a, b) => a.label < b.label ? -1 : 1);
  }
}
