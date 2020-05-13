import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {HTTP} from '@ionic-native/http/ngx';
import {Platform} from '@ionic/angular';
import {Buffer} from 'buffer';
import {parse, serialize} from '../../ipp/ipp';
import {map, timeout} from 'rxjs/operators';
import {BaseClass} from '../base';
import {NgInject} from '../decorators';

@Injectable()
export class Http extends BaseClass {
  @NgInject(HTTP) private _http1: HTTP;
  @NgInject(HttpClient) private _http2: HttpClient;
  @NgInject(Platform) private _platform: Platform;
  private static HEADERS = {
    'content-type': 'application/ipp',
    'transfer-encoding': 'chunked',
    'expect': '100-continue',
  };

  private async _doAndroid(url: string, msg: Object, timeout?: number): Promise<Object> {
    const http = await this._http1.sendRequest(url, {
      method: 'post',
      headers: Http.HEADERS,
      data: serialize(msg),
      serializer: <any>'raw',
      timeout: timeout ? timeout : 5,
    });

    const data = parse(new Buffer(new ArrayBuffer(http.data)));
    const result = parse(new Buffer(http.data));

    result['statusCode'] = data['statusCode'];

    return result;
  }

  private _doNative(url: string, msg: Object, tout?: number): Promise<Object> {
    return this._http2.request('post', url, {
      headers: new HttpHeaders(Http.HEADERS),
      body: serialize(msg).buffer,
      responseType: 'arraybuffer',
    }).pipe(map(r => parse(new Buffer(r))), timeout(tout ? tout * 1000 : 5000))
    .toPromise();
  }

  public makeRequest(url: string, msg: Object, timeout?: number) {
    if (this._platform.is('android')) {
      return this._doAndroid(url, msg, timeout);
    }

    return this._doNative(url, msg, timeout);
  }

  /**
   * If the platform is Android, the first request will always fail with a 400. 
   * I don't know why, so we do a first dummy request
   */
  public async init(url: string) {
    if (!this._platform.is('android')) {
      return ;
    }

    this.makeRequest(url, {});
  }
}
