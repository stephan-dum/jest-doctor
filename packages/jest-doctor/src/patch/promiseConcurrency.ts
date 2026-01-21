import { JestDoctorEnvironment, PromiseRecord } from '../types';
import { executionAsyncId } from 'node:async_hooks';

const patchPromiseConcurrency = (that: JestDoctorEnvironment) => {
  const env = that.global;

  const getRootIds = () => {
    let triggerId = executionAsyncId();
    const rootIds = [triggerId];

    while (triggerId !== that.asyncRoot && triggerId) {
      triggerId = that.asyncIdToParentId.get(triggerId) as number;
      rootIds.push(triggerId);
    }

    return rootIds;
  };

  const cleanPromise = (
    promises: Map<Promise<unknown>, PromiseRecord>,
    promise: Promise<unknown>,
    asyncId: number,
  ) => {
    that.asyncIdToPromise.delete(asyncId);
    that.promiseOwner.delete(asyncId);
    that.asyncIdToParentId.delete(asyncId);
    promises.delete(promise);
  };
  const removeChildPromises = (
    promises: undefined | Map<Promise<unknown>, PromiseRecord>,
    concurrentPromises: Promise<unknown>[],
    rootIds: number[],
  ) => {
    if (promises) {
      concurrentPromises.forEach((concurrentPromise) => {
        const leak = promises.get(concurrentPromise);

        if (leak) {
          let asyncId = leak.asyncId;

          // Promise.race, Promise.any and Promise.all will create a new Promise for every entry that needs to be deleted
          promises.forEach((childLeak, key) => {
            if (childLeak.parentAsyncId === asyncId) {
              cleanPromise(promises, key, childLeak.asyncId);
            }
          });

          let promiseToDelete = concurrentPromise;
          while (!rootIds.includes(asyncId) && asyncId) {
            const parentId = that.asyncIdToParentId.get(asyncId);
            cleanPromise(promises, promiseToDelete, asyncId);

            asyncId = parentId as number;
            promiseToDelete = that.asyncIdToPromise.get(
              asyncId,
            ) as Promise<unknown>;
          }
        }
      });
    }
  };

  const concurrencyFactor =
    (fn: (handler: Promise<unknown>[]) => Promise<unknown>) =>
    (concurrentPromises: Promise<void>[]) => {
      const promises = that.leakRecords.get(that.currentTestName)?.promises;
      const rootIds = getRootIds();
      return fn(concurrentPromises).finally(() => {
        removeChildPromises(promises, concurrentPromises, rootIds);
      });
    };

  env.Promise.race = concurrencyFactor(env.Promise.race.bind(env.Promise));
  env.Promise.any = concurrencyFactor(env.Promise.any.bind(env.Promise));

  const originalPromiseAll = env.Promise.all.bind(env.Promise);
  env.Promise.all = (concurrentPromises: Promise<unknown>[]) => {
    const promises = that.leakRecords.get(that.currentTestName)?.promises;
    const rootIds = getRootIds();

    return originalPromiseAll(concurrentPromises).catch((error) => {
      removeChildPromises(promises, concurrentPromises, rootIds);
      throw error;
    });
  };
};

export default patchPromiseConcurrency;
