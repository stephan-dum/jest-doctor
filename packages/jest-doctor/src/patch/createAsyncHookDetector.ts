import { promiseHooks, type Init } from 'node:v8';
import getStack from '../utils/getStack';
import { JestDoctorEnvironment, TrackedPromise, ReportOptions } from '../types';
import isIgnored from '../utils/isIgnored';

const createAsyncHookDetector = (that: JestDoctorEnvironment) => {
  const init: Init = (promise, parent: TrackedPromise) => {
    if (parent?.untrack) {
      return;
    }

    const stack = getStack(init as Function);

    if (
      !isIgnored(
        stack,
        (that.options.report.promises as ReportOptions).ignoreStack,
      )
    ) {
      const owner = that.currentTestName;
      that.promiseOwner.set(promise, owner);

      that.leakRecords.get(owner)?.promises.set(promise, {
        stack,
      });
    }
  };

  return promiseHooks.createHook({ init });
};

export default createAsyncHookDetector;
