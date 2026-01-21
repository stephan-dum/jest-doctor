import type { Circus } from '@jest/types';
import { JestDoctorEnvironment, RuntimeGlobals } from '../types';
import analyzeCallback from '../utils/analyzeCallback';

const patchIt = (
  that: JestDoctorEnvironment,
  runtimeGlobals: RuntimeGlobals,
) => {
  const originalIt = runtimeGlobals.it;
  const originalOnly = originalIt.only;
  const createItPatch =
    (originalFn: typeof originalIt | typeof originalOnly) =>
    (
      testName: Circus.TestName,
      testFunction: Circus.TestFn,
      timeout: number,
    ) => {
      const testHandler = function (this: Circus.TestContext) {
        return analyzeCallback(that, testFunction, this);
      } as Circus.TestFn;

      return originalFn(testName, testHandler, timeout);
    };

  const itPatch = createItPatch(originalIt);
  const test = Object.assign(itPatch, originalIt, {
    concurrent: itPatch,
    only: createItPatch(originalOnly),
  });

  if (that.global.test) {
    that.global.it = that.global.test = test;
  }
  runtimeGlobals.it = runtimeGlobals.test = test;
};

export default patchIt;
