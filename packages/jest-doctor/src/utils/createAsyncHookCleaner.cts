import { JestDoctorEnvironment } from '../types';
import { createHook } from 'node:async_hooks';

const createAsyncHookCleaner = (that: JestDoctorEnvironment) => {
  return createHook({
    promiseResolve(asyncId: number) {
      const owner = that.promiseOwner.get(asyncId);
      if (!owner) return;

      that.leakRecords.get(owner)?.promises.delete(asyncId);
      that.promiseOwner.delete(asyncId);
    },
  });
};

export default createAsyncHookCleaner;
