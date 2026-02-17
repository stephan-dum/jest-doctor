import type { Circus } from '@jest/types';
import type { JestDoctorEnvironment } from '../types';
import initLeakRecord from './initLeakRecord';
import cleanupAfterTest from './cleanupAfterTest';
import reportLeaks from './reportLeaks';

const getTimeoutError = (timeout: number, isHook: boolean, trace: string) => {
  const error = new Error();

  error.stack = [
    `Exceeded timeout of ${timeout}ms for a ${isHook ? 'hook' : 'test'}.`,
    `Add a timeout value to this test to increase the timeout, if this is a long-running test.`,
    `See https://jestjs.io/docs/api#testname-fn-timeout.`,
    trace,
  ].join('\n');
  return error;
};

const analyzeCallback = async (
  that: JestDoctorEnvironment,
  callback: Circus.TestFn,
  testContext: Circus.TestContext,
  timeout: number,
  isHook: boolean,
  trace: string,
) => {
  const testName =
    (that.global.expect as typeof expect).getState().currentTestName ||
    'unknown';

  const leakRecord = initLeakRecord(that, testName);

  let isRejected = false;
  let timerId: NodeJS.Timeout;
  return that.asyncStorage.run('ignored', () => {
    return new Promise((resolve, reject) => {
      timerId = setTimeout(() => {
        isRejected = true;
        reject(getTimeoutError(timeout, isHook, trace));
      }, timeout);

      void Promise.resolve(
        that.asyncStorage.run(testName, () =>
          (callback as () => Promise<unknown>).call(testContext),
        ),
      )
        .then(
          (returnValue) => {
            if (!isRejected) {
              reportLeaks(that, leakRecord);
              resolve(returnValue);
            }
          },
          (reason: Error) => {
            isRejected = true;
            reject(reason);
          },
        )
        .catch(reject);
    }).finally(() => {
      clearTimeout(timerId);
      that.asyncRoot = 0;

      cleanupAfterTest(that, leakRecord, testName, isRejected);
    });
  });
};

export default analyzeCallback;
