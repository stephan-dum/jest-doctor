import { JestDoctorEnvironment } from '../types';

const patchPromiseConcurrency = (that: JestDoctorEnvironment) => {
  const env = that.global;

  const concurrencyFactor =
    (fn: (handler: Promise<unknown>[]) => Promise<unknown>) =>
    (concurrentPromises: Promise<void>[]) => {
      const promises = that.leakRecords.get(that.currentTestName)?.promises;

      return fn(concurrentPromises).finally(() => {
        if (promises) {
          concurrentPromises.forEach((concurrentPromise) => {
            const leak = promises.get(concurrentPromise);

            if (leak) {
              const asyncId = leak?.asyncId;
              that.asyncIdToPromise.delete(asyncId);
              that.promiseOwner.delete(asyncId);
              promises.delete(concurrentPromise);

              // Promise.race and Promise.any will create a new Promise for every entry that needs to be deleted
              promises.forEach((childLeak, key) => {
                if (childLeak.parentAsyncId === asyncId) {
                  that.asyncIdToPromise.delete(childLeak.asyncId);
                  that.promiseOwner.delete(childLeak.asyncId);
                  promises.delete(key);
                }
              });
            }
          });
        }
      });
    };

  env.Promise.race = concurrencyFactor(env.Promise.race.bind(env.Promise));
  env.Promise.any = concurrencyFactor(env.Promise.any.bind(env.Promise));
};

export default patchPromiseConcurrency;
