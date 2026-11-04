import type { Circus } from '@jest/types';
import type { JestDoctorEnvironment, RuntimeGlobals } from '../types';
import analyzeCallback from '../utils/analyzeCallback';
import getStack from '../utils/getStack';
import getTimeout from '../utils/getTimeout';

const patchIt = (
  that: JestDoctorEnvironment,
  runtimeGlobals: RuntimeGlobals,
) => {
  const originalIt = runtimeGlobals.it;
  const originalOnly = originalIt.only;
  const originalFailing = originalIt.failing;
  const originalEach = originalIt.each;

  const createItPatch = (
    originalFn:
      typeof originalIt | typeof originalOnly | typeof originalFailing,
  ) =>
    function itPatcher(
      testName: Circus.TestName,
      testFunction: Circus.TestFn,
      customTimeout: number,
    ) {
      const trace = getStack(itPatcher).split('\n')[1];
      const timeout = getTimeout(that, customTimeout);

      const testHandler = function (this: Circus.TestContext) {
        return analyzeCallback(that, testFunction, this, timeout, false, trace);
      } as Circus.TestFn;

      return originalFn(testName, testHandler, timeout + 1_000);
    };

  const itPatch = createItPatch(originalIt);
  const test = Object.assign(itPatch, originalIt, {
    concurrent: Object.assign(itPatch, originalIt.concurrent),
    only: Object.assign(createItPatch(originalOnly), originalOnly),
    failing: createItPatch(originalFailing),
    each: (data: unknown[]) =>
      function eachPatcher(
        testName: Circus.TestName,
        testFunction: (...arg: unknown[]) => void,
        customTimeout: number,
      ) {
        const trace = getStack(eachPatcher).split('\n')[1];
        const timeout = getTimeout(that, customTimeout);

        const testHandler = function (
          this: Circus.TestContext,
          ...args: unknown[]
        ) {
          return analyzeCallback(
            that,
            testFunction,
            this,
            timeout,
            false,
            trace,
            args,
          );
        };

        originalEach(data)(testName, testHandler, customTimeout);
      },
  });

  if (that.global.test) {
    that.global.it = that.global.test = test;
  }

  runtimeGlobals.it = runtimeGlobals.test = test;
};

export default patchIt;
