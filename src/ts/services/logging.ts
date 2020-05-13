import {EventEmitter, ErrorHandler} from '@angular/core';
import {environment} from '../../environments/environment';
import {LogLevel} from '../models';

export type LogEvent = {
  stack: Array<string>;
  args: any;
  level: LogLevel;
}

export class Logger implements ErrorHandler {
  public level: LogLevel = typeof(environment.logLevel) == 'undefined' ? LogLevel.ERROR : environment.logLevel;
  public includeStack: boolean = environment.logStack;

  public logged: EventEmitter<LogEvent> = new EventEmitter<LogEvent>();

  // private _sysLog: LoggingService;

  private _log(level: LogLevel, ...args: any[]) {
    if (level >= this.level) {
      let stack = [];
      if (environment.production) {

      }
      else {
        if (this.includeStack) {
          stack = Error().stack.split("\n");
          console.trace();
          console.log(stack);
        }

        console.log.apply(console, args[0]);
        this.logged.emit({stack: stack, args: args, level: level});
      }
    }
  }

  public handleError(error: any) {
    console.log('error is', error);
    this._log(LogLevel.ERROR, [error.message, (error.stack || '').split("\n")]);
  }

  public debug(...args: any[]) {
    this._log(LogLevel.DEBUG, args);
  }

  public info(...args: any) {
    this._log(LogLevel.INFO, args);
  }

  public error(...args: any[]) {
    this._log(LogLevel.ERROR, args);
  }
}

export class LoggingInstance {
  public static logger = new Logger();
}
