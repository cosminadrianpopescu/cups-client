import {Component, Input, SimpleChanges, Output, EventEmitter, ViewEncapsulation} from '@angular/core';
import {BaseComponent} from '../base';
import {NgCycle} from '../decorators';
import {LabelValue} from './models';

@Component({
  selector: 'cups-dropdown',
  templateUrl: './dropdown.html',
  styleUrls: ['./dropdown.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class Dropdown extends BaseComponent {
  @Input() public options: Array<LabelValue> = [];
  @Input() public isPrimitive: boolean = false;
  @Input() public disabled: boolean = false;
  @Input() public optionLabel: string = "label";
  @Input() public model: string | LabelValue;
  @Input() public label: string;
  @Input() public type: 'dropdown' | 'radio' | 'sheet' = 'dropdown';
  @Input() public vertical: boolean = false;
  @Input() public showClear: boolean = false;

  public id: string;

  @Output() public modelChange: EventEmitter<string | LabelValue> = new EventEmitter<string | LabelValue>();

  protected _model: LabelValue = null;
  protected _sheetOpened: boolean = false;

  @NgCycle('init')
  protected _init() {
    this.id = `_${BaseComponent.UUID()}`;
  }

  @NgCycle('change')
  protected _change(changes: SimpleChanges) {
    if (changes['model'] && this.model) {
      const option = this.options.find(o => this.isPrimitive ? o.value == this.model : o.value == (this.model as LabelValue).value);
      if (!option) {
        this.options.push(this.isPrimitive ? {value: this.model as string, label: this.model as string} : this.model as LabelValue);
      }
    }
    if (!this.isPrimitive || !changes['model']) {
      this._model = this.model as LabelValue;
      return ;
    }

    this._model = this.options.find(o => o.value == this.model);
  }

  protected _modelChange(x: LabelValue) {
    this._sheetOpened = false;
    if (x == null) {
      this._model = null;
      this.modelChange.emit(null);
      return ;
    }
    this._model = this.options.find(o => o.value == x.value)
    if (!this.isPrimitive) {
      this.modelChange.emit(x);
      return ;
    }

    this.modelChange.emit(x.value);
  }

  protected async _sheetSelect() {
    this._sheetOpened = true;
    await new Promise(resolve => setTimeout(resolve));
    document.querySelector('.sheet-item--selected').scrollIntoView({block: 'center'});
  }
}
