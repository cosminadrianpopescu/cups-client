import {NgModule, Injector, ComponentFactoryResolver, ApplicationRef} from '@angular/core';
import {TextInput} from './input';
import {Dropdown} from './dropdown';
import {Tag} from './tag';
import {Button} from './button';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {DropdownModule} from 'primeng/dropdown';
import {TagModule} from 'primeng/tag';
import {List} from './list';
import {CommonModule} from '@angular/common';
import * as pipes from './pipes';
import {FormsModule} from '@angular/forms';
import {SidebarModule} from 'primeng/sidebar';
import {Checkbox} from './checkbox';
import {InputSwitchModule} from 'primeng/inputswitch';
import {CheckboxModule} from 'primeng/checkbox';
import {PullRefresh} from './pull-refresh';
import {ToastModule} from 'primeng/toast';
import {MessageService} from 'primeng/api';
import {Toast} from './toast';
import {Messages} from './messages';

const DECLARATIONS = [TextInput, Button, Dropdown, Tag, List, Checkbox, PullRefresh,];

@NgModule({
  declarations: [
    ...DECLARATIONS, pipes.IsSeparator, pipes.Sorted, Toast,
  ],
  entryComponents: [Toast],
  imports: [
    ButtonModule, InputTextModule, DropdownModule, TagModule, CommonModule,
    FormsModule, SidebarModule, InputSwitchModule, CheckboxModule, ToastModule,
  ],
  providers: [MessageService, Messages],
  exports: DECLARATIONS,
})
export class PrimengWrappers {
  constructor(inj: Injector, resolver: ComponentFactoryResolver, appRef: ApplicationRef) {
    const ref = resolver.resolveComponentFactory(Toast).create(inj);
    appRef.attachView(ref.hostView);
    document.body.appendChild(ref.hostView['rootNodes'][0]);
  }
}
