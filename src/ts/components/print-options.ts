import {Component, Input} from '@angular/core';
import {BaseComponent} from '../base';

@Component({
  selector: 'cups-print-options',
  templateUrl: '../../html/print-options.html',
  styleUrls: ['../../assets/scss/print-options.scss'],
})
export class PrintOptions extends BaseComponent {
  @Input() public callback: (ev: 'cloud' | 'local') => void;
}
