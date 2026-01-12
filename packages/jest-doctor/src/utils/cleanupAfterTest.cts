import { JestDoctorEnvironment, LeakRecord, FakeTimers } from '../types';

const cleanupAfterTest = (
  that: JestDoctorEnvironment,
  leakRecord: LeakRecord,
  testName: string,
) => {
  if (that.currentAfterEachCount === 0) {
    if (that.shouldCleanup) {
      // to avoid warnings when useRealTimers is enabled, but there are still pending fake timers,
      // the internal object will be reset instead of calling that.fakeTimersModern.clearAllTimers
      const fakeTimers = (that.fakeTimersModern as unknown as FakeTimers)?._clock?.timers || {};
      for (const key of Object.keys(fakeTimers)) {
        delete fakeTimers[key];
      }
      for (const timerId of leakRecord.timeout.keys()) {
        that.original.clearTimeout(timerId);
      }
      for (const intervalId of leakRecord.interval.keys()) {
        that.original.clearInterval(intervalId);
      }
    }

    that.leakRecords.delete(testName);
  }
};

export default cleanupAfterTest;
