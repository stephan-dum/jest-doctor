import type { Circus } from '@jest/types';
import type { JestDoctorEnvironment } from '../types';
import analyzeCallback from '../utils/analyzeCallback';
import console from 'node:console';

const patchIt = (that: JestDoctorEnvironment) => {
  const originalIt = that.global.it;

  if (originalIt) {
    const originalOnly = that.global.it.only;
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

    Object.assign(itPatch, originalIt);

    that.global.it = that.global.test = itPatch as unknown as typeof originalIt;

    that.global.it.concurrent = that.global.it;
    that.global.it.only = createItPatch(
      originalOnly,
    ) as unknown as typeof originalOnly;
  } else {
    console.warn(
      'injectGlobal it is set to false, this will impact on leak detection!',
    );
  }
};

export default patchIt;
