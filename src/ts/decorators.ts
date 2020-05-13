import { Type } from '@angular/core';

export type CycleType = 'destroy' | 'afterViewInit' | 'change' | 'init';

export type TestCase = {method: string, name: string};

export const TEST_CASES: Map<Function, Array<TestCase>> = new Map<Function, Array<TestCase>>();

function __decorate(protoName: string, arg: Type<any> | string | CycleType) {
  return function(ctor: any, property: string) {
    if (typeof(ctor.constructor.prototype[protoName]) == 'undefined') {
      ctor.constructor.prototype[protoName] = new Map<string, Object>();
    }

    if (typeof(ctor.constructor.prototype[protoName].get(ctor.constructor.name)) == 'undefined') {
      ctor.constructor.prototype[protoName].set(ctor.constructor.name, []);
    }

    ctor.constructor.prototype[protoName].get(ctor.constructor.name).push({prop: property, arg: arg});
  }
}

export function NgInject(type: Type<any> | string) {
  return __decorate('__injectors__', type);
}

export function NgCycle(cycle: CycleType) {
  return __decorate('__cycles__', cycle);
}

export function NgTest(name?: string) {
  return function(ctor: any, property: string) {
    if (typeof(TEST_CASES.get(ctor.constructor)) == 'undefined') {
      TEST_CASES.set(ctor.constructor, []);
    }
    TEST_CASES.get(ctor.constructor).push({name: name, method: property});
  }
}
