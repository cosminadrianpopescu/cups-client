import { Routes } from '@angular/router';
import { Printers } from '../pages/printers';
import { Job } from '../pages/job';
import { Settings } from '../pages/settings';
import {Guard} from '../services/guard';

export const routes: Routes = [
  { path: 'settings', component: Settings, data: {title: 'Settings'} },
  { path: 'job', component: Job, data: {title: 'Job Options'}, canActivate: [Guard] },
  { path: 'printers', component: Printers, data: {title: 'Printers on Server'}, canActivate: [Guard] },
  { path: '', redirectTo: 'printers', pathMatch: 'full' },
];
