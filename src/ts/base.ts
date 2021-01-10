import {EventEmitter, Injector, Provider, SimpleChanges, TemplateRef, Injectable, ComponentFactoryResolver, ApplicationRef, ComponentRef, EmbeddedViewRef} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {Router} from '@angular/router';
import {Toast} from '@ionic-native/toast/ngx';
import {Observable, Subscription} from 'rxjs';
import {CycleType, METADATA, NgInject} from './decorators';
import {App} from './services/app';
import {Logger, LoggingInstance} from './services/logging';
import {Loading} from './components/loading';
import {Platform} from '@ionic/angular';
import {Messages} from './wrappers/messages';
import {take} from 'rxjs/operators';

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

@Injectable()
export class Spinner extends BaseClass {
  @NgInject(<any>ComponentFactoryResolver) private _resolver: ComponentFactoryResolver;
  @NgInject(ApplicationRef) private _app: ApplicationRef;
  private _component: ComponentRef<any> = null;

  public async show(): Promise<void> {
    if (this._component) {
      return ;
    }

    this._component = this._resolver.resolveComponentFactory(Loading).create(Statics.injector);
    this._app.attachView(this._component.hostView);
    const node = (this._component.hostView as EmbeddedViewRef<any>).rootNodes[0];
    document.body.appendChild(node);
  }

  public async hide(): Promise<void> {
    if (!this._component) {
      return ;
    }
    this._app.detachView(this._component.hostView);
    this._component.destroy();
    this._component = null;
  }
}

export class BaseComponent extends BaseClass {
  @NgInject(Router) protected _router: Router;
  @NgInject(Toast) private _toast: Toast;
  @NgInject(Spinner) private _spinner: Spinner;
  @NgInject(Platform) private __platform__: Platform;
  @NgInject(Messages) private _messages: Messages;

  public static UUID(): string {
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

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

  private ngOnDestroy() {
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

  private async ngOnInit() {
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
    this._spinner.show();
  }

  protected async hideLoading() {
    this._spinner.hide();
  }

  protected get isJobPage(): boolean {
    return this._router.url.match(/job$/) ? true : false;
  }

  protected async alert(message: string) {
    if (this.__platform__.is('desktop')) {
      this._messages.toast(message);
      return ;
    }
    this._toast.show(message, '3000', 'bottom').subscribe(() => {});
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
