import { JestDoctorEnvironment } from '../types';
import getStack from '../utils/getStack';

const patchPromise = (that: JestDoctorEnvironment) => {
  const OriginalPromise = that.global.Promise;

  class TrackedPromise<T> extends OriginalPromise<T> {
    constructor(
      executor: (
        resolve: (value: T | PromiseLike<T>) => void,
        reject: (reason?: unknown) => void,
      ) => void,
    ) {
      let resolveRef: (value: T | PromiseLike<T>) => void;
      let rejectRef: (reason?: unknown) => void;

      super((resolve, reject) => {
        resolveRef = resolve;
        rejectRef = reject;
      });

      const promiseLeaks = that.leakRecords.get(that.currentTestName)?.promises;

      promiseLeaks?.set(this, {
        testName: that.currentTestName,
        stack: getStack(that.global.Promise),
      });

      executor(
        (value: T | PromiseLike<T>) => {
          promiseLeaks?.delete(this);
          resolveRef(value);
        },
        (reason: unknown) => {
          promiseLeaks?.delete(this);
          rejectRef(reason);
        },
      );
    }
  }

  Object.assign(Promise, OriginalPromise);
  that.global.Promise = TrackedPromise;
};

export default patchPromise;
