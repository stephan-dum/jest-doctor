import { promiseHooks, type Init } from 'node:v8';
import { executionAsyncId, triggerAsyncId } from 'node:async_hooks';
import getStack from '../utils/getStack';
import { JestDoctorEnvironment, ReportOptions } from '../types';
import isIgnored from '../utils/isIgnored';

const createAsyncHookDetector = (that: JestDoctorEnvironment) => {
  const init: Init = (promise) => {
    const asyncId = executionAsyncId();
    const parentAsyncId = triggerAsyncId();

    that.asyncIdToParentId.set(asyncId, parentAsyncId);
    that.asyncIdToPromise.set(asyncId, promise);

    const stack = getStack(init as Function);
    if (
      !isIgnored(
        stack,
        (that.options.report.promises as ReportOptions).ignoreStack,
      )
    ) {
      const owner = that.currentTestName;
      that.promiseOwner.set(promise, owner);
      that.promiseToAsyncId.set(promise, asyncId);

      that.leakRecords.get(owner)?.promises.set(promise, {
        stack,
        asyncId,
        parentAsyncId,
      });
    }
  };

  return promiseHooks.createHook({ init });
};

export default createAsyncHookDetector;
