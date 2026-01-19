import { createHook, type HookCallbacks } from 'node:async_hooks';
import getStack from './getStack';
import type { JestDoctorEnvironment } from '../types';

const createAsyncHookDetector = (that: JestDoctorEnvironment) => {
  const init: HookCallbacks['init'] = (
    asyncId,
    type,
    parentAsyncId,
    resource,
  ) => {
    if (type !== 'PROMISE') {
      return;
    }

    const promise = resource as Promise<unknown>;
    const owner = that.currentTestName;
    that.promiseOwner.set(asyncId, owner);
    that.asyncIdToPromise.set(asyncId, promise);

    that.leakRecords.get(owner)?.promises.set(promise, {
      stack: getStack(init as Function, 'Promise'),
      testName: owner,
      asyncId,
      parentAsyncId,
    });
  };

  return createHook({ init });
};

export default createAsyncHookDetector;
