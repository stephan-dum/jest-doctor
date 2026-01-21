import { FakeTimers, JestDoctorEnvironment, ReportOptions } from '../types';
import getStack from '../utils/getStack';
import isIgnored from '../utils/isIgnored';
import chalk from 'chalk';

const patchFakeTimers = (that: JestDoctorEnvironment) => {
  const modernFakeTimers = that.fakeTimersModern as unknown as FakeTimers;
  const fakeTimers = modernFakeTimers?._fakeTimers;
  const originalFakeTimerInstall = fakeTimers?.install;

  if (fakeTimers && originalFakeTimerInstall) {
    const originalClearAllTimers =
      modernFakeTimers.clearAllTimers.bind(modernFakeTimers);

    modernFakeTimers.clearAllTimers = () => {
      that.leakRecords.get(that.currentTestName)?.fakeTimers.clear();
      originalClearAllTimers();
    };

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

        const stack = getStack(that.global.setTimeout);

        if (
          !isIgnored(
            stack,
            (that.options.report.fakeTimers as ReportOptions).ignore,
          )
        ) {
          fakeTimeout?.set(timerId, {
            type: 'fakeTimeout',
            delay: delay || 0,
            stack,
          });
        }

        return timerId;
      };

      clock.setInterval = function (callback, delay) {
        const intervalId = originalFakeSetInterval(callback, delay);
        const stack = getStack(that.global.setInterval);

        if (
          !isIgnored(
            stack,
            (that.options.report.fakeTimers as ReportOptions).ignore,
          )
        ) {
          that.leakRecords
            .get(that.currentTestName)
            ?.fakeTimers.set(intervalId, {
              type: 'fakeInterval',
              delay: delay || 0,
              stack,
            });
        }

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
    that.original.stderr(chalk.yellow('\nFake timers could not be mocked!'));
  }
};

export default patchFakeTimers;
