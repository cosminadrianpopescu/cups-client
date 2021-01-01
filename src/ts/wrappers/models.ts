import {Observable} from 'rxjs';

export class LabelValue {
  label: string;
  value: string;
}

export interface ListDatasource<T> {
  fetch(): Observable<Array<T>> | Promise<Array<T>>;
  /**
   * Return a string in this function to treat the row as a separator
   * The returned string will be displayed as a separator. 
   * Return null or an empty string if the current row is not a separator.
   */
  separatorLabel?(row: T): string;
}
