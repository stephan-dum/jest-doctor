import { createHook, type HookCallbacks } from 'node:async_hooks';
import getStack from '../utils/getStack';
import { JestDoctorEnvironment, ReportOptions } from '../types';
import isIgnored from '../utils/isIgnored';

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

    that.asyncIdToParentId.set(asyncId, parentAsyncId);

    const stack = getStack(init as Function);
    if (
      !isIgnored(stack, (that.options.report.promises as ReportOptions).ignore)
    ) {
      const owner = that.currentTestName;
      that.promiseOwner.set(asyncId, owner);
      const promise = resource as Promise<unknown>;
      that.asyncIdToPromise.set(asyncId, promise);

      that.leakRecords.get(owner)?.promises.set(promise, {
        stack,
        asyncId,
        parentAsyncId,
      });
    }
  };

  return createHook({ init });
};

export default createAsyncHookDetector;
