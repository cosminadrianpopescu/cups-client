import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from '../base';
import {PrinterOptionsGroup, PrinterOption} from '../models';
import {NgCycle} from '../decorators';

@Component({
  templateUrl: '../../html/option.html',
  selector: 'cups-option',
})
export class Option extends BaseComponent {
  @Input() public group: PrinterOptionsGroup;
  @Output() public notify: EventEmitter<PrinterOption> = new EventEmitter<PrinterOption>();

  @NgCycle('init')
  protected _initMe() {
  }

  protected _select(ev) {
    console.log('ev is', ev);
  }
}
