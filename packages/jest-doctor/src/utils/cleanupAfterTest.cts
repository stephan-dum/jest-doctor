import { JestDoctorEnvironment, LeakRecord, FakeTimers } from '../types';

const cleanupAfterTest = (
  that: JestDoctorEnvironment,
  leakRecord: LeakRecord,
  testName: string,
) => {
  if (that.currentAfterEachCount === 0) {
    if (that.options.clearTimers) {
      // to avoid warnings when useRealTimers is enabled, but there are still pending fake timers,
      // the internal object will be reset instead of calling that.fakeTimersModern.clearAllTimers
      const fakeTimers =
        (that.fakeTimersModern as unknown as FakeTimers)?._clock?.timers || {};
      for (const key of Object.keys(fakeTimers)) {
        delete fakeTimers[key];
      }
      for (const [timerId, record] of leakRecord.timers.entries()) {
        if (record.type === 'timeout') {
          that.original.clearTimeout(timerId);
        } else {
          that.original.clearInterval(timerId);
        }
      }
    }

    that.leakRecords.delete(testName);
  }
};

export default cleanupAfterTest;
