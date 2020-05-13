import {Type} from '@angular/core';
import {Intent} from '@ionic-native/web-intent/ngx';

export enum LogLevel {DEBUG = 0, INFO = 1, ERROR = 2};

export class ModelFactory {
  private static _create<T>(json: Object, type: Type<T>): T {
    const result = new type();
    Object.keys(json).forEach(k => result[k] = json[k]);
    return result;
  }
  public static instance<T>(json: Object | Array<Object>, type: Type<T>): T | Array<T> {
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
