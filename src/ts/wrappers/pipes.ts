import {Pipe} from '@angular/core';
import {ListDatasource} from './models';

@Pipe({name: 'isSeparator'})
export class IsSeparator<T> {
  public transform(row: T, ds: ListDatasource<T>): string {
    if (!ds.separatorLabel) {
      return null;
    }

    return ds.separatorLabel(row);
  }
}
