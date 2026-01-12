import type { JestDoctorEnvironment } from '../types';
import type { Circus } from '@jest/types';
import analyzeCallback from './analyzeCallback.cjs';

const patchIt = (that: JestDoctorEnvironment) => {
  const originalIt = that.global.it;
  const test = that.global.expect as typeof expect;

  const itPatch = (
    testName: Circus.TestNameLike,
    testFunction: Circus.TestFn,
    timeout: number,
  ) => {
    const testHandler = function (this: Circus.TestContext) {
      const testName = test.getState().currentTestName || 'unknown';
      return analyzeCallback(that, testName, testFunction, this);
    } as Circus.TestFn;

    return originalIt(testName, testHandler, timeout);
  };

  Object.assign(itPatch, originalIt);

  that.global.it =
    that.global.test =
    that.global.it.only =
    that.global.it.concurrent =
      itPatch as unknown as typeof originalIt;
};

export default patchIt;
