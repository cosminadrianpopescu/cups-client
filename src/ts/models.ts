import {Type} from '@angular/core';
import {Intent} from '@ionic-native/web-intent/ngx';
import {deserializers, Convertor} from './decorators';

export type SettingsSection = 'url' | 'nc';

export enum LogLevel {DEBUG = 0, INFO = 1, ERROR = 2};

export type Primitive = boolean | string | number;

export type ObjectType<T> = T | Primitive | Array<T | Primitive>;

export class ModelFactory {
  private static _primitive(obj: Primitive): Primitive {
    if (typeof(obj) == 'boolean') {
      return obj as boolean;
    }

    if (typeof(obj) == 'string') {
      return obj as string;
    }

    if (typeof(obj) == 'number') {
      return obj as number;
    }
  }

  private static _create<T>(json: Object, type: Type<T>): T {
    const result = new type();
    Object.keys(json).map(k => k.replace(/^@/g, '')).forEach(k => {
      const d = deserializers(type).find(d => d.prop == k);
      const value = typeof(json['@' + k]) == 'undefined' ? json[k] : json['@' + k];
      if (!d || typeof(value) == 'undefined' || value == null) {
        result[k] = value;
        return ;
      }
      if (d.arg == 'date') {
        result[k] = new Date(json[k]);
        return ;
      }
      if (typeof(d.arg) == 'function' && !!d.arg.prototype['convert']) {
        const convertor: Convertor<any> = new d.arg();
        result[k] = convertor.convert(value);
        return ;
      }
      result[k] = ModelFactory.instance(value, d.arg);
    });
    return result;
  }
  public static instance<T>(json: ObjectType<Object>, type?: Type<T>): ObjectType<T> {
    if (typeof(json) == 'undefined' || json == null) {
      return null;
    }

    if (typeof(type) == 'undefined') {
      if (typeof(json) == 'object' && !Array.isArray(json)) {
        throw Error('UNKNOWN_TYPE');
      }

      if (Array.isArray(json)) {
        return json.map(o => ModelFactory._primitive(o as Primitive) as Primitive);
      }

      return ModelFactory._primitive(json) as Primitive;
    }

    if (Array.isArray(json)) {
      return json.map(j => ModelFactory._create(j, type));
    }
    return ModelFactory._create(json, type);
  }
}
export enum ServerStatus {
  ERROR, READY, NO_SERVER,
}

export class AppState {
  status: ServerStatus;
  intent: Intent;
  printer: Printer;
  error: Error;
}

export class PrinterOption {
  key: string;
  value: string;
}

export class PrinterOptionsGroup {
  name: string;
  cupsKey: string;
  description: string;
  options: Array<PrinterOption>;
  default: string;
  selected: string;
}

export class Printer {
  name: string;
  default: boolean;
  options: Array<PrinterOptionsGroup>;
}

export class CupsServer {
  name: string;
  url: string;
  printers: Array<Printer>
}

export async function to<T>(promise: Promise<T>): Promise<[Error, T]> {
  try {
    const data = await promise;
    return [null, data];
  }
  catch (err) {
    return [err, null];
  }
}
