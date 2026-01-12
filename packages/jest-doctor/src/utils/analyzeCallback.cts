import { JestDoctorEnvironment } from '../types';
import initLeakRecord from './initLeakRecord.cjs';
import { MAIN_THREAD } from '../consts.cjs';
import cleanupAfterTest from './cleanupAfterTest.cjs';
import reportLeaks from './reportLeaks.cjs';
import { Circus } from '@jest/types';

const analyzeCallback = async (
  that: JestDoctorEnvironment,
  testName: string,
  callback: Circus.TestFn,
  testContext: Circus.TestContext,
) => {
  // is used to avoid jest internal polluting test promises
  await Promise.resolve().then(() => {});

  that.currentTestName = testName;
  const leakRecord = initLeakRecord(that, that.currentTestName);

  let returnValue: unknown;
  try {
    returnValue = await (callback as () => Promise<unknown>).call(testContext);
  } finally {
    that.currentTestName = MAIN_THREAD;

    // give the promise a tick time to resolve
    await Promise.resolve().then(() => {});

    cleanupAfterTest(that, leakRecord, testName);
  }

  reportLeaks(that, leakRecord);
  return returnValue;
};

export default analyzeCallback;
