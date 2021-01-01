import {NgModule} from '@angular/core';
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

const DECLARATIONS = [TextInput, Button, Dropdown, Tag, List, ];

@NgModule({
  declarations: [
    ...DECLARATIONS, pipes.IsSeparator,
  ],
  imports: [
    ButtonModule, InputTextModule, DropdownModule, TagModule, CommonModule,
    FormsModule,
  ],
  exports: DECLARATIONS,
})
export class PrimengWrappers {

}
