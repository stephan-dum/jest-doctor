import type { Circus } from '@jest/types';
import type { JestDoctorEnvironment } from '../types';
import initLeakRecord from './initLeakRecord';
import { MAIN_THREAD } from '../consts';
import cleanupAfterTest from './cleanupAfterTest';
import reportLeaks from './reportLeaks';

const analyzeCallback = async (
  that: JestDoctorEnvironment,
  callback: Circus.TestFn,
  testContext: Circus.TestContext,
) => {
  // is used to avoid jest internal polluting test promises
  await Promise.resolve().then(() => {});
  const testName =
    (that.global.expect as typeof expect).getState().currentTestName ||
    'unknown';
  that.currentTestName = testName;
  const leakRecord = initLeakRecord(that, that.currentTestName);

  let returnValue: unknown;
  try {
    returnValue = await (callback as () => Promise<unknown>).call(testContext);
  } finally {
    that.currentTestName = MAIN_THREAD;

    // give the promise and intervals a tick time to resolve
    await Promise.resolve().then(() => {});

    cleanupAfterTest(that, leakRecord, testName);
  }

  reportLeaks(that, leakRecord);
  return returnValue;
};

export default analyzeCallback;
