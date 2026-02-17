import { JestDoctorEnvironment, TrackedPromise } from '../types';

const patchPromiseConcurrency = (that: JestDoctorEnvironment) => {
  const env = that.global;
  const setup = (concurrentPromises: TrackedPromise[]) => {
    concurrentPromises.forEach((concurrentPromise) => {
      if (concurrentPromise instanceof env.Promise) {
        concurrentPromise.untrack = true;
      }
    });

    return that.leakRecords.get(that.currentTestName)?.promises;
  };

  const concurrencyFactor =
    (fn: (handler: Promise<unknown>[]) => Promise<unknown>) =>
    (concurrentPromises: TrackedPromise[]) => {
      const promises = setup(concurrentPromises);

      return fn(concurrentPromises).finally(() => {
        concurrentPromises.forEach((concurrentPromise) => {
          promises?.delete(concurrentPromise);
          that.promiseOwner.delete(concurrentPromise);
        });
      });
    };

  env.Promise.race = concurrencyFactor(env.Promise.race.bind(env.Promise));
  env.Promise.any = concurrencyFactor(env.Promise.any.bind(env.Promise));

  const originalPromiseAll = env.Promise.all.bind(env.Promise);
  env.Promise.all = (concurrentPromises: TrackedPromise[]) => {
    const promises = setup(concurrentPromises);

    return originalPromiseAll(concurrentPromises).catch((reason) => {
      concurrentPromises.forEach((concurrentPromise) => {
        promises?.delete(concurrentPromise);
        that.promiseOwner.delete(concurrentPromise);
      });

      throw reason;
    });
  };
};

export default patchPromiseConcurrency;
