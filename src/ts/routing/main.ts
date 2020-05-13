import { Routes } from '@angular/router';
import { Printers } from '../pages/printers';
import { Servers } from '../pages/servers';
import { Job } from '../pages/job';

export const routes: Routes = [
  { path: 'job', component: Job, data: {title: 'Job Options'} },
  { path: 'printers', component: Printers, data: {title: 'Printers on Server'} },
  { path: 'servers', component: Servers, data: {title: 'Add Cups Server'} },
  { path: '', redirectTo: 'printers', pathMatch: 'full' },
];
