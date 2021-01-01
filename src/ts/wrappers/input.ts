import {Component, EventEmitter, Input, Output, SimpleChanges, ElementRef, ViewChild} from '@angular/core';
import {BaseComponent} from '../base';
import {NgCycle} from '../decorators';

@Component({
  selector: 'cups-input',
  templateUrl: './input.html',
  styleUrls: ['./input.scss'],
})
export class TextInput extends BaseComponent {
  @Input() public icon: string = null;
  @Input() public validator: 'required' | 'custom' | 'none' = 'none';
  @Input() public isValid: boolean = true;
  @Input() public isFloatLabel: boolean = true;
  @Input() public type: 'text' | 'password' | 'numeric' = 'text';
  @Input() public model: string;
  @Input() public label: string;
  @Input() public withBorder: boolean = true;

  @Output() public iconClick = new EventEmitter();
  @Output() public keyup: EventEmitter<KeyboardEvent> = new EventEmitter<KeyboardEvent>();
  @Output() public modelChange: EventEmitter<string> = new EventEmitter<string>();
  
  @ViewChild('input', {static: false}) public input: ElementRef<any>;

  public focus() {
    this.input.nativeElement.focus();
  }

  @NgCycle('change')
  protected _change(changes: SimpleChanges) {
    if (!changes['model'] || this.validator != 'required') {
      return ;
    }

    this.isValid = !!this.model;
  }
}
