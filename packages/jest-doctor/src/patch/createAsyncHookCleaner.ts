import type { JestDoctorEnvironment } from '../types';
import { promiseHooks } from 'node:v8';

const createAsyncHookCleaner = (that: JestDoctorEnvironment) => {
  return promiseHooks.createHook({
    settled(promise) {
      const asyncId = that.promiseToAsyncId.get(promise) as number;
      that.asyncIdToParentId.delete(asyncId);
      that.asyncIdToPromise.delete(asyncId);
      const owner = that.promiseOwner.get(promise);

      if (!owner) {
        return;
      }

      that.leakRecords.get(owner)?.promises.delete(promise);
      that.promiseOwner.delete(promise);
      that.promiseToAsyncId.delete(promise);
    },
  });
};

export default createAsyncHookCleaner;
