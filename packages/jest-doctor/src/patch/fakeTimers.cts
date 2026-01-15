import type { FakeTimers, JestDoctorEnvironment } from '../types';
import getStack from '../utils/getStack.cjs';

const patchFakeTimers = (that: JestDoctorEnvironment) => {
  const fakeTimers = (that.fakeTimersModern as unknown as FakeTimers)
    ?._fakeTimers;
  const originalFakeTimerInstall = fakeTimers?.install;

  if (fakeTimers && originalFakeTimerInstall) {
    fakeTimers.install = (config) => {
      const clock = originalFakeTimerInstall(config);

      const originalFakeSetTimeout = clock.setTimeout.bind(clock);
      const originalFakeSetInterval = clock.setInterval.bind(clock);
      const originalFakeClearTimeout = clock.clearTimeout.bind(clock);
      const originalFakeClearInterval = clock.clearInterval.bind(clock);

      clock.setTimeout = function (callback, delay) {
        const fakeTimeout = that.leakRecords.get(
          that.currentTestName,
        )?.fakeTimers;

        const timerId = originalFakeSetTimeout(() => {
          fakeTimeout?.delete(timerId);
          callback();
        }, delay);

        fakeTimeout?.set(timerId, {
          type: 'fakeTimeout',
          delay: delay || 0,
          stack: getStack(that.global.setTimeout),
          testName: that.currentTestName,
        });

        return timerId;
      };

      clock.setInterval = function (callback, delay) {
        const intervalId = originalFakeSetInterval(callback, delay);

        that.leakRecords.get(that.currentTestName)?.fakeTimers.set(intervalId, {
          type: 'fakeInterval',
          delay: delay || 0,
          stack: getStack(that.global.setInterval),
          testName: that.currentTestName,
        });

        return intervalId;
      };

      clock.clearTimeout = (timerId) => {
        that.leakRecords.get(that.currentTestName)?.fakeTimers.delete(timerId);
        originalFakeClearTimeout(timerId);
      };

      clock.clearInterval = (intervalId) => {
        that.leakRecords
          .get(that.currentTestName)
          ?.fakeTimers.delete(intervalId);
        originalFakeClearInterval(intervalId);
      };

      return clock;
    };
  } else {
    that.original.console.warn('Fake timers could not be mocked!');
  }
};

export default patchFakeTimers;
