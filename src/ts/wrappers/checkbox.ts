import {Component, Input, Output, EventEmitter} from '@angular/core';
import {BaseComponent} from '../base';
import {NgCycle} from '../decorators';

@Component({
  selector: 'cups-checkbox',
  templateUrl: './checkbox.html',
  styleUrls: ['./checkbox.scss'],
})
export class Checkbox extends BaseComponent {
  @Input() public model: boolean;
  @Input() public withSwitch: boolean = true;
  @Input() public id: string = null;

  @Output() public modelChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  @NgCycle('init')
  protected _initMe() {
    this.id = BaseComponent.UUID();
  }
}
