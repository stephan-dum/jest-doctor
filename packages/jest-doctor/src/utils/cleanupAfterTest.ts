import type { JestDoctorEnvironment, LeakRecord } from '../types';

const cleanupAfterTest = (
  that: JestDoctorEnvironment,
  leakRecord: LeakRecord,
  testName: string,
) => {
  if (that.currentAfterEachCount === 0) {
    if (that.options.clearTimers) {
      // @ts-expect-error it is public but signaled as internal
      if (that.fakeTimers?._fakingTime) {
        that.fakeTimers.clearAllTimers();
      }
      // @ts-expect-error it is public but signaled as internal
      if (that.fakeTimersModern?._fakingTime) {
        that.fakeTimersModern.clearAllTimers();
      }

      for (const [timerId, record] of leakRecord.timers.entries()) {
        if (record.type === 'timeout') {
          that.original.timer.clearTimeout(timerId as NodeJS.Timeout);
        } else {
          that.original.timer.clearInterval(timerId as NodeJS.Timeout);
        }
      }
    }

    that.leakRecords.delete(testName);
  }
};

export default cleanupAfterTest;
