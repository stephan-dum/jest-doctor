import { JestDoctorEnvironment } from '../types';
import { Circus } from '@jest/types';
import analyzeCallback from './analyzeCallback.cjs';

const patchHook = (that: JestDoctorEnvironment, hookName: string) => {
  const originalHook = that.global[hookName] as typeof beforeEach;
  const test = that.global.expect as typeof expect;
  that.global[hookName] = function (callback, timeout) {
    const hookMock = function (this: Circus.TestContext) {
      if (hookName === 'afterEach') {
        that.currentAfterEachCount -= 1;
      }

      const testName = test.getState().currentTestName || 'unknown';
      return analyzeCallback(that, testName, callback as Circus.TestFn, this);
    };

    // unfortunately, jest types the return type as any
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return originalHook(hookMock, timeout);
  } as typeof beforeEach;
};

export default patchHook;
