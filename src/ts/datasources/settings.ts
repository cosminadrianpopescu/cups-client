import {Injectable} from '@angular/core';
import {BaseClass} from '../base';
import {SettingsSection} from '../models';
import {ListDatasource} from '../wrappers/models';

@Injectable({providedIn: 'root'})
export class Settings extends BaseClass implements ListDatasource<SettingsSection> {
  
  public async fetch(): Promise<SettingsSection[]> {
    return ['url', 'nc'];
  }
}
