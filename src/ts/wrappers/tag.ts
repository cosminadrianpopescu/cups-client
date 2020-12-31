import {Component, Input} from '@angular/core';
import {BaseComponent} from '../base';

@Component({
  selector: 'cups-tag',
  templateUrl: './tag.html',
  styleUrls: ['./tag.scss'],
})
export class Tag extends BaseComponent {
  @Input() public styleClass: string;
  @Input() public severity: string;
  @Input() public label: string;
}
