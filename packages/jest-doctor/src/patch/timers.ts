import type { JestDoctorEnvironment } from '../types';
import getStack from '../utils/getStack';
import { MAIN_THREAD } from '../consts';

const timers = (that: JestDoctorEnvironment) => {
  const env = that.global;

  env.setTimeout = Object.assign(
    function (callback: () => void, delay?: number) {
      const owner = that.currentTestName;
      const leakRecord = that.leakRecords.get(owner);

      const timerId = that.original.setTimeout(() => {
        if (leakRecord) {
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
        stack: getStack(env.setTimeout, 'fake setTimeout'),
        testName: owner,
      });

      return timerId;
    } as typeof env.setTimeout,
    that.original.setTimeout,
  );

  env.setInterval = Object.assign(
    function (callback: () => void, delay?: number) {
      const owner = that.currentTestName;

      const intervalId = that.original.setInterval(() => {
        if (owner !== MAIN_THREAD && delay) {
          const leakRecord = that.leakRecords.get(owner);

          if (leakRecord) {
            leakRecord.totalDelay += delay;
          }
        }

        callback();
      }, delay);

      that.leakRecords.get(owner)?.timers.set(intervalId, {
        type: 'interval',
        delay: delay || 0,
        stack: getStack(env.setInterval, 'fake setInterval'),
        testName: that.currentTestName,
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
