import {EventEmitter, Injector, Provider, SimpleChanges, TemplateRef} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {Router} from '@angular/router';
import {LoadingController, ToastController} from '@ionic/angular';
import {Observable, Subscription} from 'rxjs';
import {CycleType, METADATA, NgInject} from './decorators';
import {Logger, LoggingInstance} from './services/logging';
import {App} from './services/app';

export class Statics {
  public static injector: Injector;
  public static validatorTemplate: TemplateRef<any>;
}

class BaseClassWithDecorations {
  protected __resolveDecorations__(protoName: string, component: any, callback: Function) {
    if (component.name == '') {
      return ;
    }
    const values: Map<string, Array<Object>> = METADATA.get(component) || new Map<string, Array<Object>>();
    if (Array.isArray(values.get(protoName))) {
      values.get(protoName).forEach(<any>callback.bind(this));
    }

    this.__resolveDecorations__(protoName, component.__proto__, callback);
  }

  protected __resolveInjectors__() {
    this.__resolveDecorations__('__injectors__', this.constructor, (obj: Object) => this[obj['prop']] = Statics.injector.get(obj['arg']));
  }
}

export class BaseClass extends BaseClassWithDecorations {
  protected _logger: Logger = LoggingInstance.logger;

  constructor() {
    super();
    this.__resolveInjectors__();
  }
}

export class BaseComponent extends BaseClass {
  @NgInject(Router) protected _router: Router;
  @NgInject(LoadingController) private _loading: LoadingController;
  @NgInject(ToastController) private _toast: ToastController;

  public get view(): any {
    return this;
  }

  private _isDispatcher(): boolean {
    return typeof(this['__isDispatcher__']) != 'undefined' && this['__isDispatcher__'] == true;
  }

  private __cycles__: Map<string, Array<string>> = new Map<string, Array<string>>();
  private __subscriptions__: Array<Subscription> = [];
  private _htmlLoading: HTMLIonLoadingElement;

  protected _isValid: boolean = true;

  constructor() {
    super();
    this.__resolveDecorations__('__cycles__', this.constructor, (obj: Object) => {
      if (!this.__cycles__.get(obj['arg'])) {
        this.__cycles__.set(obj['arg'], []);
      }
      this.__cycles__.get(obj['arg']).push(obj['prop']);
    });
  }

  private _runCycle(cycle: CycleType, args?: any) {
    (this.__cycles__.get(cycle) || []).forEach(method => this[method](args));
  }

  private ionViewDidLeave() {
    this._runCycle('destroy');
    this.__subscriptions__.forEach(s => s.unsubscribe());
  }

  private ngAfterViewInit() {
    this._runCycle('afterViewInit');
  }

  private ngOnChanges(changes: SimpleChanges) {
    this._runCycle('change', changes);
  }

  protected async _handleError(err: Error) {
    await this.hideLoading();
    console.error(err);
    await this.alert(err.message || err['error'] || err.name || err.constructor.name);
  }

  private async ionViewDidEnter() {
    // if (this._isDispatcher()) {
    //   const result = await this['__doDispatch__']();
    //   // If we did a dispatch
    //   if (result === true) {
    //     // Stop the rest of the page execution
    //     return;
    //   }
    // }
    this.connect(App.dispatchDone$, () => {
      this._runCycle('init');
    });
  }

  protected connect<T>(obs: Observable<T>, callback: (t: T) => void) {
    this.__subscriptions__.push(obs.subscribe(callback));
  }

  protected navigate(url: string): Promise<boolean>{
    return this._router.navigateByUrl(url);
  }

  protected async showLoading(message: string) {
    this._htmlLoading = await this._loading.create({message: message});
    await this._htmlLoading.present();
  }

  protected async hideLoading() {
    if (this._htmlLoading) {
      await this._htmlLoading.dismiss();
    }
  }

  protected get isJobPage(): boolean {
    return this._router.url.match(/job$/) ? true : false;
  }

  protected async alert(message: string) {
    const toast = await this._toast.create({
      message: message,
      duration: 3000,
    });
    toast.present();
  }
}

export class BaseTestUnit extends BaseClassWithDecorations {
  protected initialized = new EventEmitter();
  constructor(private _providers: Array<Provider>) {
    super();
  }

  private __init__() {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({providers: this._providers});
    Statics.injector = TestBed;
    this.__resolveInjectors__();
    this.initialized.emit();
  }
}
