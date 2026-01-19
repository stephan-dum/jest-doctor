import type { Circus } from '@jest/types';
import type { JestDoctorEnvironment } from '../types';
import analyzeCallback from '../utils/analyzeCallback';

const patchHook = (that: JestDoctorEnvironment, hookName: string) => {
  const originalHook = that.global[hookName] as typeof beforeEach;

  that.global[hookName] = function (callback, timeout) {
    const hookMock = function (this: Circus.TestContext) {
      if (hookName === 'afterEach') {
        that.currentAfterEachCount -= 1;
      }

      return analyzeCallback(that, callback as Circus.TestFn, this);
    };

    // unfortunately, jest types the return type as any
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return originalHook(hookMock, timeout);
  } as typeof beforeEach;
};

export default patchHook;
