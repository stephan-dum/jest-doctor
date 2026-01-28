import { JestDoctorEnvironment } from '../types';
import getStack from '../utils/getStack';
import { MAIN_THREAD } from '../consts';
import isIgnored from '../utils/isIgnored';

const patchTimers = (that: JestDoctorEnvironment) => {
  const env = that.global;
  const report = that.options.report;

  const patch = () => {
    if (env.setImmediate) {
      env.setImmediate = ((callback: () => void) => {
        const owner = that.currentTestName;
        const leakRecord = that.leakRecords.get(owner);

        const stack = getStack(env.setTimeout);
        const isAllowed =
          report.timers && !isIgnored(stack, report.timers.ignoreStack);

        const timerId = that.original.timer.setImmediate(() => {
          if (leakRecord && isAllowed) {
            leakRecord.timers.delete(timerId);
          }
          callback();
        });

        leakRecord?.timers.set(timerId, {
          type: 'setImmediate',
          stack,
          isAllowed,
        });

        return timerId;
      }) as typeof setImmediate;

      env.clearImmediate = (immediate) => {
        that.leakRecords
          .get(that.currentTestName)
          ?.timers.delete(immediate as NodeJS.Immediate);

        that.original.timer.clearImmediate(immediate);
      };
    }

    env.setTimeout = Object.assign(
      function (callback: () => void, delay?: number) {
        const owner = that.currentTestName;
        const leakRecord = that.leakRecords.get(owner);

        const stack = getStack(env.setTimeout);
        const isAllowed =
          report.timers && !isIgnored(stack, report.timers.ignoreStack);

        const timerId = that.original.timer.setTimeout(() => {
          if (leakRecord && isAllowed) {
            if (owner !== MAIN_THREAD && delay) {
              leakRecord.totalDelay += delay;
            }

            leakRecord.timers.delete(timerId);
          }
          callback();
        }, delay);

        leakRecord?.timers.set(timerId, {
          type: 'timeout',
          delay: delay || 0,
          stack,
          isAllowed,
        });

        return timerId;
      } as typeof env.setTimeout,
      that.original.timer.setTimeout,
    );

    env.setInterval = Object.assign(
      function (callback: () => void, delay?: number) {
        const owner = that.currentTestName;
        const leakRecord = that.leakRecords.get(owner);
        const stack = getStack(env.setInterval);
        const isAllowed =
          report.timers && !isIgnored(stack, report.timers.ignoreStack);

        const intervalId = that.original.timer.setInterval(() => {
          if (isAllowed && owner !== MAIN_THREAD && delay && leakRecord) {
            leakRecord.totalDelay += delay;
          }

          callback();
        }, delay);

        that.leakRecords.get(owner)?.timers.set(intervalId, {
          type: 'interval',
          delay: delay || 0,
          isAllowed,
          stack,
        });

        return intervalId;
      } as typeof env.setInterval,
      that.original.timer.setInterval,
    );

    env.clearTimeout = (timerId) => {
      that.leakRecords
        .get(that.currentTestName)
        ?.timers.delete(timerId as NodeJS.Timeout);
      that.original.timer.clearTimeout(timerId);
    };

    env.clearInterval = (intervalId) => {
      that.leakRecords
        .get(that.currentTestName)
        ?.timers.delete(intervalId as NodeJS.Timeout);
      that.original.timer.clearInterval(intervalId);
    };
  };

  if (that.fakeTimers) {
    // legacy fake timers will overwrite the existing objects and not restore them
    const originalUseRealTimers = that.fakeTimers.useRealTimers.bind(
      that.fakeTimers,
    );
    that.fakeTimers.useRealTimers = () => {
      originalUseRealTimers();
      patch();
    };
  }

  patch();
};

export default patchTimers;
