import type { Circus } from '@jest/types';
import { JestDoctorEnvironment, RuntimeGlobals, RuntimeHooks } from '../types';
import analyzeCallback from '../utils/analyzeCallback';
import getStack from '../utils/getStack';

const patchHook = (
  that: JestDoctorEnvironment,
  hookName: string,
  runtimeGlobals: RuntimeGlobals,
) => {
  const originalHook = that.global[hookName] as typeof beforeEach;

  that.global[hookName] = runtimeGlobals[hookName as keyof RuntimeHooks] =
    function hookPatcher(callback, timeout = that.testTimeout) {
      const trace = getStack(hookPatcher).split('\n')[1];
      const hookMock = function (this: Circus.TestContext) {
        if (hookName === 'afterEach') {
          that.currentAfterEachCount -= 1;
        }

        return analyzeCallback(
          that,
          callback as Circus.TestFn,
          this,
          timeout,
          true,
          trace,
        );
      };

      // unfortunately, jest types the return type as any
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return originalHook(hookMock, timeout + 1_000);
    } as typeof beforeEach;
};

export default patchHook;
