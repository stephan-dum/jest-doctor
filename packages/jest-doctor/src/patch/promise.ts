import { JestDoctorEnvironment, ReportOptions } from '../types';
import getStack from '../utils/getStack';
import isIgnored from '../utils/isIgnored';

type Resolve<T> = (value: T | PromiseLike<T>) => void;
type Reject = (reason?: unknown) => void;
type Executor<T> = (resolve: Resolve<T>, reject: Reject) => void;
const patchPromise = (that: JestDoctorEnvironment) => {
  const global = that.global;
  const OriginalPromise = global.Promise;
  const ignoreStack = (that.options.report.promises as ReportOptions)
    .ignoreStack;

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
    promises: (undefined | TrackedPromise<unknown>)[],
    method: 'all' | 'race' | 'any',
  ) => {
    promises.forEach((promise) => {
      if (promise instanceof TrackedPromise) {
        promise.untrack = true;
        untrack(promise);
      }
    });

    return (
      OriginalPromise[method] as unknown as (
        promises: (undefined | Promise<unknown>)[],
      ) => Promise<never>
    )(promises);
  };

  class TrackedPromise<T> extends OriginalPromise<T> {
    public untrack: true | undefined;

    constructor(executor: Executor<T>) {
      const promises = that.leakRecords.get(that.currentTestName)?.promises;
      let resolver: Resolve<T>;
      let rejecter: Reject;

      super((resolve, reject) => {
        resolver = resolve;
        rejecter = reject;
      });

      const innerExecutor: Executor<T> = (resolve, reject) => {
        const wrappedResolve: Resolve<T> = (value) => {
          promises?.delete(this);
          resolve(value);
        };
        const wrappedReject: Reject = (reason) => {
          promises?.delete(this);
          reject(reason);
        };

        try {
          executor(wrappedResolve, wrappedReject);
        } catch (error) {
          wrappedReject(error);
        }
      };

      track(this, TrackedPromise);

      // @ts-expect-error constructor will run first
      innerExecutor(resolver, rejecter);
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
