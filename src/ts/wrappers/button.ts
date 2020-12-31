import {Component, EventEmitter, Input, Output} from '@angular/core';
import {BaseComponent} from '../base';

@Component({
  selector: 'cups-button', 
  templateUrl: './button.html',
  styleUrls: ['./button.scss'],
})
export class Button extends BaseComponent {
  @Input() public label: string;
  @Input() public disabled: boolean = false;
  @Input() public icon: string;
  @Input() public tabindex: number = -1;
  @Input() public isText: boolean = true;
  @Input() public styleClass: string;
  @Input() public noWrap: boolean = true;

  @Output() public notify: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

  protected _click(ev: MouseEvent) {
    if (this.disabled) {
      ev.stopPropagation();
      ev.stopImmediatePropagation();
      ev.preventDefault();
      return ;
    }

    this.notify.emit(ev);
  }
}
