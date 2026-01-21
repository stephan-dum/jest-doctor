import { JestDoctorEnvironment } from '../types';
import getStack from '../utils/getStack';
import { MAIN_THREAD } from '../consts';
import isIgnored from '../utils/isIgnored';

const timers = (that: JestDoctorEnvironment) => {
  const env = that.global;
  const report = that.options.report;

  env.setTimeout = Object.assign(
    function (callback: () => void, delay?: number) {
      const owner = that.currentTestName;
      const leakRecord = that.leakRecords.get(owner);

      const stack = getStack(env.setTimeout);
      const isAllowed =
        report.timers && !isIgnored(stack, report.timers.ignore);

      const timerId = that.original.setTimeout(() => {
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
    that.original.setTimeout,
  );

  env.setInterval = Object.assign(
    function (callback: () => void, delay?: number) {
      const owner = that.currentTestName;
      const leakRecord = that.leakRecords.get(owner);
      const stack = getStack(env.setInterval);
      const isAllowed =
        report.timers && !isIgnored(stack, report.timers.ignore);

      const intervalId = that.original.setInterval(() => {
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
    that.original.setInterval,
  );

  env.clearTimeout = (timerId) => {
    that.leakRecords
      .get(that.currentTestName)
      ?.timers.delete(timerId as NodeJS.Timeout);
    that.original.clearTimeout(timerId);
  };

  env.clearInterval = (intervalId) => {
    that.leakRecords
      .get(that.currentTestName)
      ?.timers.delete(intervalId as NodeJS.Timeout);
    that.original.clearInterval(intervalId);
  };
};

export default timers;
