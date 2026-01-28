import { JestDoctorEnvironment, ReportOptions } from '../types';
import getStack from '../utils/getStack';
import isIgnored from '../utils/isIgnored';
import chalk from 'chalk';
import { LegacyFakeTimers, ModernFakeTimers } from '@jest/fake-timers';

const patchFakeTimers = (that: JestDoctorEnvironment) => {
  const env = that.global;
  const patchTimersLifeCycles = (api: ModernFakeTimers | LegacyFakeTimers) => {
    const originalUseFakeTimers = api.useFakeTimers.bind(api);

    api.useFakeTimers = (config) => {
      originalUseFakeTimers(config);

      const originalFakeSetTimeout = env.setTimeout;

      env.setTimeout = Object.assign(function (
        callback: () => void,
        delay: number,
      ) {
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
            (that.options.report.fakeTimers as ReportOptions).ignoreStack,
          )
        ) {
          fakeTimeout?.set(timerId, {
            type: 'fakeTimeout',
            delay: delay || 0,
            stack,
          });
        }

        return timerId;
      }, env.setTimeout);

      const originalFakeSetInterval = env.setInterval;

      env.setInterval = Object.assign(function (
        callback: () => void,
        delay: number,
      ) {
        const intervalId = originalFakeSetInterval(callback, delay);
        const stack = getStack(that.global.setInterval);

        if (
          !isIgnored(
            stack,
            (that.options.report.fakeTimers as ReportOptions).ignoreStack,
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
      }, env.setInterval);

      const originalFakeClearTimeout = env.clearTimeout;

      env.clearTimeout = Object.assign((timerId: NodeJS.Timeout) => {
        that.leakRecords.get(that.currentTestName)?.fakeTimers.delete(timerId);
        originalFakeClearTimeout(timerId);
      }, env.clearTimeout);

      const originalFakeClearInterval = env.clearInterval;

      env.clearInterval = Object.assign((intervalId: NodeJS.Timeout) => {
        that.leakRecords
          .get(that.currentTestName)
          ?.fakeTimers.delete(intervalId);
        originalFakeClearInterval(intervalId);
      }, env.clearInterval);

      if (env.setImmediate) {
        const originalSetImmediate = env.setImmediate;
        env.setImmediate = Object.assign((callback: () => void) => {
          const fakeTimeout = that.leakRecords.get(
            that.currentTestName,
          )?.fakeTimers;

          const timerId = originalSetImmediate(() => {
            fakeTimeout?.delete(timerId);
            callback();
          });

          const stack = getStack(env.setImmediate);

          if (
            !isIgnored(
              stack,
              (that.options.report.fakeTimers as ReportOptions).ignoreStack,
            )
          ) {
            fakeTimeout?.set(timerId, {
              type: 'fakeSetImmediate',
              stack,
            });
          }

          return timerId;
        }, env.setImmediate);

        const originalClearImmediate = env.clearImmediate;
        env.clearImmediate = Object.assign((timerId: NodeJS.Immediate) => {
          that.leakRecords
            .get(that.currentTestName)
            ?.fakeTimers.delete(timerId);
          originalClearImmediate(timerId);
        }, env.clearImmediate);
      }
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
    that.original.process.stderr(
      chalk.yellow('\nModern fake timers could not be mocked!'),
    );
  }

  if (that.fakeTimers) {
    patchTimersLifeCycles(that.fakeTimers);
  } else {
    that.original.process.stderr(
      chalk.yellow('\nLegacy fake timers could not be mocked!'),
    );
  }
};

export default patchFakeTimers;
