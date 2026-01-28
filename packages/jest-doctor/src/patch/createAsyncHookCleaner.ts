import type { JestDoctorEnvironment } from '../types';
import { createHook } from 'node:async_hooks';

const createAsyncHookCleaner = (that: JestDoctorEnvironment) => {
  return createHook({
    promiseResolve(asyncId: number) {
      that.asyncIdToParentId.delete(asyncId);
      const owner = that.promiseOwner.get(asyncId);

      if (!owner) {
        return;
      }

      const promise = that.asyncIdToPromise.get(asyncId);

      if (promise) {
        that.leakRecords.get(owner)?.promises.delete(promise);
        that.promiseOwner.delete(asyncId);
        that.asyncIdToPromise.delete(asyncId);
      }
    },
  });
};

export default createAsyncHookCleaner;
