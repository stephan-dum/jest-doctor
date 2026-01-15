import { createHook, type HookCallbacks } from 'node:async_hooks';
import getStack from './getStack.cjs';
import type { JestDoctorEnvironment } from '../types';

const createAsyncHookDetector = (that: JestDoctorEnvironment) => {
  const init: HookCallbacks['init'] = (asyncId, type, triggerAsyncId) => {
    if (type !== 'PROMISE') return;

    const owner = that.currentTestName;
    that.promiseOwner.set(asyncId, owner);

    that.leakRecords.get(owner)?.promises.set(asyncId, {
      stack: getStack(init as Function),
      triggerAsyncId,
      testName: owner,
    });
  };

  return createHook({ init });
};

export default createAsyncHookDetector;
