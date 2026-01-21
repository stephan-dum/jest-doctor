import { Clock, JestDoctorEnvironment, ReportOptions } from '../types';
import getStack from '../utils/getStack';
import isIgnored from '../utils/isIgnored';
import chalk from 'chalk';
import { LegacyFakeTimers, ModernFakeTimers } from '@jest/fake-timers';

const patchFakeTimers = (that: JestDoctorEnvironment) => {
  const env = that.global as unknown as Clock;
  const patchTimersLifeCycles = (api: ModernFakeTimers | LegacyFakeTimers) => {
    const originalUseFakeTimers = api.useFakeTimers.bind(api);

    api.useFakeTimers = (config) => {
      originalUseFakeTimers(config);

      const originalFakeSetTimeout = env.setTimeout.bind(env);
      const originalFakeSetInterval = env.setInterval.bind(env);
      const originalFakeClearTimeout = env.clearTimeout.bind(env);
      const originalFakeClearInterval = env.clearInterval.bind(env);

      env.setTimeout = function (callback, delay) {
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

      env.setInterval = function (callback, delay) {
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

      env.clearTimeout = (timerId) => {
        that.leakRecords.get(that.currentTestName)?.fakeTimers.delete(timerId);
        originalFakeClearTimeout(timerId);
      };

      env.clearInterval = (intervalId) => {
        that.leakRecords
          .get(that.currentTestName)
          ?.fakeTimers.delete(intervalId);
        originalFakeClearInterval(intervalId);
      };
    };

    const originalClearAllTimers = api.clearAllTimers.bind(api);

    api.clearAllTimers = () => {
      that.leakRecords.get(that.currentTestName)?.fakeTimers.clear();
      originalClearAllTimers();
    };
  };

  if (that.fakeTimersModern) {
    patchTimersLifeCycles(that.fakeTimersModern);
  } else {
    that.original.stderr(
      chalk.yellow('\nModern fake timers could not be mocked!'),
    );
  }

  if (that.fakeTimers) {
    patchTimersLifeCycles(that.fakeTimers);
  } else {
    that.original.stderr(
      chalk.yellow('\nLegacy fake timers could not be mocked!'),
    );
  }
};

export default patchFakeTimers;
