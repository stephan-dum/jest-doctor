import { JestDoctorEnvironment } from '../types';
import getStack from '../utils/getStack';
import isIgnored from '../utils/isIgnored';

type Resolve<T> = (value: T | PromiseLike<T>) => void;
type Reject = (reason?: unknown) => void;
type Executor<T> = (resolve: Resolve<T>, reject: Reject) => void;
const patchPromise = (that: JestDoctorEnvironment) => {
  const global = that.global;
  const OriginalPromise = global.Promise;
  const ignoreStack =
    (that.options.report.promises &&
      that.options.report.promises.ignoreStack) ||
    [];

  const track = (promise: Promise<unknown>, stackFrom: Function) => {
    const stack = getStack(stackFrom);

    if (!isIgnored(stack, ignoreStack)) {
      const promises = that.leakRecords.get(that.currentTestName)?.promises;

      promises?.set(promise, {
        stack,
        asyncId: 0,
        parentAsyncId: 0,
      });
    }
  };

  const untrack = (promise: Promise<unknown>) => {
    that.leakRecords.get(that.currentTestName)?.promises.delete(promise);
  };

  const concurrencyFactory = (
    promises: TrackedPromise<unknown>[],
    method: 'all' | 'race' | 'any',
  ) => {
    promises.forEach((promise) => {
      promise.untrack = true;
    });

    return (
      OriginalPromise[method] as unknown as (
        promises: Promise<unknown>[],
      ) => Promise<never>
    )(promises).finally(() => {
      promises.forEach((promise) => {
        untrack(promise);
      });
    });
  };

  class TrackedPromise<T> extends OriginalPromise<T> {
    public untrack: true | undefined;

    constructor(executor: Executor<T>) {
      const promises = that.leakRecords.get(that.currentTestName)?.promises;
      const innerExecutor: Executor<T> = (resolve, reject) => {
        const wrappedResolve: Resolve<T> = (value) => {
          promises?.delete(this);
          resolve(value);
        };
        const wrappedReject: Reject = (reason) => {
          promises?.delete(this);
          reject(reason);
        };

        return executor(wrappedResolve, wrappedReject);
      };

      super(innerExecutor);

      track(this, TrackedPromise);
    }

    then<TResult1 = T, TResult2 = unknown>(
      onFulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
      onRejected?:
        | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
        | null,
    ) {
      const promise = super.then(onFulfilled, onRejected);

      if (this.untrack) {
        untrack(promise);
      }

      return promise;
    }

    static any(promises: TrackedPromise<unknown>[]) {
      return concurrencyFactory(promises, 'any');
    }
    static race(promises: TrackedPromise<unknown>[]) {
      return concurrencyFactory(promises, 'race');
    }
    static all(promises: TrackedPromise<unknown>[]) {
      return concurrencyFactory(promises, 'all');
    }
  }

  global.Promise = TrackedPromise;
};

export default patchPromise;
