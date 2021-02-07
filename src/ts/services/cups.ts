import {Injectable} from '@angular/core';
import {Buffer} from 'buffer';
import {ReplaySubject} from 'rxjs';
import {filter, take} from 'rxjs/operators';
import {BaseClass} from '../base';
import {NgInject} from '../decorators';
import {CupsServer, Printer, PrinterOption, PrinterOptionsGroup, ServerStatus, to} from '../models';
import {Http} from './http';
import {Store} from './store';
import {App} from './app';

const DEFAULT_KEY = 'defaultPrinter';

@Injectable()
export class Cups extends BaseClass {
  public servers: Array<CupsServer> = null;
  @NgInject(Store) private _store: Store;
  @NgInject(Http) private _http: Http;

  public status$: ReplaySubject<ServerStatus> = new ReplaySubject<ServerStatus>(1);
  private _server: CupsServer;

  public async init() {
    this.servers = await this._store.servers();

    if (this.servers.length == 1) {
      this._server = this.servers[0];
      await to(this._printers(1));
      const [err, result] = await to(this._printers(4));
      if (err) {
        App.state.error = err;
        this.status$.next(ServerStatus.ERROR);
        return ;
      }
      this._server.printers = result;
      this.status$.next(ServerStatus.READY);
    }

    if (this.servers.length == 0) {
      this.status$.next(ServerStatus.NO_SERVER);
    }
  }

  constructor() {
    super();
    this.init();

    this.status$.pipe(filter(s => s == ServerStatus.READY), take(1)).subscribe(() => this._http.init(this._server.url));
  }

  public async add(s: CupsServer): Promise<void>{
    this.servers.push(s);
    this._server = s;
    await this._store.setServers(this.servers);
    await this.init();
  }

  private async _doCupsJob(name: string, printer: Printer, attributes: Object, data: ArrayBuffer): Promise<Object> {
    const request = {
      version: '1.1',
      operation: 2,
      statusCode: 'successful-ok-conflicting-attributes',
      'operation-attributes-tag': {
        'attributes-charset': 'utf-8',
        'attributes-natural-language': 'en-us',
        'printer-uri': this._server.url + '/printers/' + printer.name,
        'requesting-user-name': 'anonymous',
        'job-name': name,
      },
      'job-attributes-tag': attributes,
      data: new Buffer(data),
    }

    return this._http.makeRequest(this._server.url, request);
  }

  private _doCupsRequest(operation: number, uri: string, attributes: Array<string>, timeout?: number): Promise<Object> {
    const request = {
      version: '1.1',
      operation: operation,
      id: 1,
      'operation-attributes-tag': {
        'attributes-charset': 'utf-8',
        'attributes-natural-language': 'en-us',
        'printer-uri': this._server.url + uri,
        'requested-attributes': attributes
      }
    }

    return this._http.makeRequest(this._server.url, request, timeout);
  }

  private _createOption(name: string, key: string, tags: Object, tag: string, defaultTag: string): PrinterOptionsGroup {
    const result = <PrinterOptionsGroup>{
      name: name,
      cupsKey: key,
      default: tags[defaultTag],
      description: '',
      options: [],
    }
    if (!result.default && defaultTag === 'orientation-requested-default') {
      result.default = 'portrait';
    }
    const options: Array<string> = Array.isArray(tags[tag]) ? tags[tag] : [tags[tag]];
    result.options = options.map(o => <PrinterOption>{
      key: o,
      value: o.charAt(0).toUpperCase() + o.slice(1),
    });

    if (!result.default && result.options.length > 0) {
      result.default = result.options[0].key;
    }

    return result;
  }

  private async _printers(timeout?: number): Promise<Array<Printer>> {
    const defP: Printer = await <Promise<Printer>>this._store.load(DEFAULT_KEY, Printer);
    const payload = await this._doCupsRequest(16386, '/printers', [
      'printer-name', 'orientation-requested-supported', 'job-settable-attributes-supported',
      'orientation-requested-default', 'sides-supported', 'sides-default'
    ], timeout);
    const result: Array<Printer> = [];
    console.log('payload is', payload);
    (payload['printer-attributes-tag'] || []).forEach((t: {[x: string]: string;}) => {
      const p = new Printer;
      p.name = t['printer-name'];
      p.options = [];
      const settable = t['job-settable-attributes-supported'];
      if (settable.indexOf('orientation-requested') != -1) {
        p.options.push(this._createOption('Orientation', 'orientation-requested', t, 'orientation-requested-supported', 'orientation-requested-default'));
      }

      if (settable.indexOf('sides') != -1) {
        p.options.push(this._createOption('Page sides', 'sides', t, 'sides-supported', 'sides-default'));
      }

      if (defP && p.name === defP.name) {
        p.default = true;
      }

      result.push(p);
    });
    return result;
  }

  public async setDefault(p: Printer) {
    await this._store.save(DEFAULT_KEY, p);
    this._server.printers.forEach(p => p.default = false);
    p.default = true;
  }

  public get printers(): Array<Printer> {
    return this._server.printers;
  }

  public validatePages(pages: string): boolean {
    if (!pages) {
      return true;
    }
    return pages.replace(/ /g, '').match(/^[0-9,\-]*$/) ? true : false;
  }

  private _parsePages(pages: string): Array<Array<number>> {
    if (!pages) {
      return null;
    }

    const result = [];
    pages.split(',').forEach(p => {
      if (p.match(/^[0-9]+$/)) {
        result.push([parseInt(p), parseInt(p)]);
        return ;
      }

      const pat = /^([^\-]+)-(.*)$/;
      result.push([parseInt(p.replace(pat, '$1')), parseInt(p.replace(pat, '$2'))]);
    });

    return result;
  }

  // public async print(uri: string, printer: string): Promise<Object>{
  //   const file = await this._file.readFile(uri);
  //   return await this._doCupsJob(printer, {'orientation-requested': 'portrait'}, file);
  // }

/*{
  'orientation-requested': 'landscape',
  copies: 2,
  'page-ranges': [ [ 1, 1 ], [ 2, 2 ], [ 3, 5 ] ],
  sides: 'two-sided-long-edge',
  'fit-to-page': true
}*/

  private _buildJobOpject(options: Array<PrinterOptionsGroup>): Object {
    return options.reduce((acc, v) => {
      if (v.selected) {
        acc[v.cupsKey] = v.selected;
      }

      return acc;
    }, {});
  }

  public async print(jobName: string, file: ArrayBuffer, ppd: Array<PrinterOptionsGroup>, pages: string, copies: number, fit: boolean): Promise<Object>{
    const p = this._parsePages(pages);
    let options = {copies: copies};
    if (Array.isArray(p)) {
      options['page-ranges'] = p;
    }
    if (typeof(fit) !== 'undefined') {
      options['fit-to-page'] = fit;
    }
    options = Object.assign(options, this._buildJobOpject(App.state.printer.options), this._buildJobOpject(ppd));
    return this._doCupsJob(jobName, App.state.printer, options, file);
  }

  public async getMimeTypes(printer: Printer): Promise<Array<string>> {
    const result = await this._doCupsRequest(11, '/printers/' + printer.name, ['document-format-supported']);
    if (result['printer-attributes-tag'] && result['printer-attributes-tag']['document-format-supported']) {
      return result['printer-attributes-tag']['document-format-supported'];
    }
    return [];
  }

  private _parsePpd(ppd: string): Array<PrinterOptionsGroup> {
    const result: Array<PrinterOptionsGroup> = [];
    const lines = ppd.split("\n").filter(line => !!line);
    let i = 0;
    let currentGroup: PrinterOptionsGroup = null;
    let currentOption: string = null;
    const p1 = /^\*OpenUI \*([^\/]+)\/?([^:]+)?(:.*)?$/;
    const p2 = /^\*Default([^:]+): (.*)$/;
    const p3 = /^\*CloseUI.*/;
    while (i < lines.length) {
      const line = lines[i++];
      if (line.match(p1)) {
        currentGroup = new PrinterOptionsGroup();
        currentGroup.name = line.replace(p1, '$1');
        currentGroup.cupsKey = currentGroup.name;
        currentGroup.description = line.replace(p1, '$2');
        currentGroup.options = [];
      }
      if (line.match(p2) && currentGroup) {
        currentOption = line.replace(p2, '$1');
        currentGroup.default = line.replace(p2, '$2');
      }
      if (currentGroup && currentOption) {
        const p = new RegExp(`^\\*${currentOption} ([^/]+)/([^:]+):.*$`);
        if (line.match(p)) {
          const key = line.replace(p, '$1');
          const value = line.replace(p, '$2');
          currentGroup.options.push(<PrinterOption>{key: key, value: value});
        }
      }
      if (line.match(p3)) {
        result.push(currentGroup);
        currentGroup = null;
        currentOption = null;
      }
    }
    return result;
  }

  public async updateCurrent(s: CupsServer) {
    if (!this._server) {
      await this.add(s);
      this._server = s;
      return ;
    }
    this._server.url = s.url;
    await this._store.setServers(this.servers);
    await this.init();
  }

  public async getPpd(printer: Printer): Promise<Array<PrinterOptionsGroup>> {
    const data = await this._doCupsRequest(16399, '/printers/' + printer.name, []);
    if (data['statusCode'] != 'successful-ok') {
      return [];
    }
    return this._parsePpd(data['data']);
  }
}
