import { Type } from '@angular/core';

export type CycleType = 'destroy' | 'afterViewInit' | 'change' | 'init';

export type TestCase = {method: string, name: string};

export const TEST_CASES: Map<Function, Array<TestCase>> = new Map<Function, Array<TestCase>>();

export const METADATA: Map<Function, Map<string, Array<any>>> = new Map<Function, Map<string, Array<any>>>();

function __decorate(protoName: string, arg: Type<any> | string | CycleType) {
  return function(ctor: any, property: string) {
    if (!METADATA.get(ctor.constructor)) {
      METADATA.set(ctor.constructor, new Map<string, Array<string>>());
    }
    const m = METADATA.get(ctor.constructor);

    if (typeof(m.get(protoName)) == 'undefined') {
      m.set(protoName, []);
    }

    m.get(protoName).push({prop: property, arg: arg});
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
