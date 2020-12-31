import {NgModule} from '@angular/core';
import {TextInput} from './input';
import {Dropdown} from './dropdown';
import {Tag} from './tag';
import {Button} from './button';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {DropdownModule} from 'primeng/dropdown';
import {TagModule} from 'primeng/tag';

const DECLARATIONS = [TextInput, Button, Dropdown, Tag];

@NgModule({
  declarations: DECLARATIONS,
  imports: [ButtonModule, InputTextModule, DropdownModule, TagModule, ],
  exports: DECLARATIONS,
})
export class PrimengWrappers {

}
