import {NgModule} from '@angular/core';
import {Filepick} from './filepick';
import {DynamicDialogModule, DialogService} from 'primeng/dynamicdialog';
import {TreeModule} from 'primeng/tree';
import {PrimengWrappers} from '../wrappers/module';

@NgModule({
  declarations: [Filepick,],
  entryComponents: [Filepick],
  imports: [DynamicDialogModule, TreeModule, PrimengWrappers, ],
  providers: [DialogService],
  exports: [Filepick],
})
export class NextcloudModule {

}
