import {Component, Input} from '@angular/core';
import {BaseComponent} from '../base';

/**
 * Generated class for the AccordionComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'cups-accordion',
  templateUrl: '../../html/accordion.html',
  styleUrls: ['../../assets/scss/accordion.scss'],
})
export class Accordion extends BaseComponent {
  @Input('title') public title: string;

  private _icon: string = "arrow-forward";
  private _expanded = false;

  protected _toggle() {
    // if (this._expanded) {
    //   this.renderer.setStyle(this.cardContent.nativeElement, "max-height", "0px");
    //   this.renderer.setStyle(this.cardContent.nativeElement, "padding", "0px 16px");

    // } else {
    //   this.renderer.setStyle(this.cardContent.nativeElement, "max-height", "500px");
    //   this.renderer.setStyle(this.cardContent.nativeElement, "padding", "13px 16px");

    // }

    // this._expanded = !this._expanded;
    // this._icon = this._icon == "arrow-forward" ? "arrow-down" : "arrow-forward";

  }

}

