import { ConsoleOptions, JestDoctorEnvironment } from '../types';
import { LeakRecord } from '../types';
import console from 'node:console';

const reportLeaks = (that: JestDoctorEnvironment, leakRecord: LeakRecord) => {
  const checkError = (
    property: 'promises' | 'timers' | 'fakeTimers',
    label: string,
  ) => {
    if (leakRecord[property].size) {
      const message = [
        `${leakRecord[property].size} open ${label}(s) found!`,
        leakRecord[property].values().next().value?.stack,
      ].join('\n');

      leakRecord[property].clear();

      if (that.options.report[property] === 'throw') {
        const error = new Error();
        error.stack = message;
        throw error;
      } else {
        console.warn(message);
      }
    }
  };

  if (leakRecord.console.length) {
    const message = [
      `${leakRecord.console.length} console output found!`,
      leakRecord.console[0].message.slice(0, 20),
      leakRecord.console[0].stack,
    ].join('\n');

    leakRecord.console = [];

    if ((that.options.report.console as ConsoleOptions).onError === 'throw') {
      const error = new Error();
      error.stack = message;
      throw error;
    } else {
      console.warn(message);
    }
  }

  checkError('promises', 'promise');

  if (that.currentAfterEachCount === 0) {
    if (leakRecord.totalDelay) {
      const message = `setTimeout / setInterval with total delay of ${leakRecord.totalDelay}ms found, use fake timers instead!`;

      if (leakRecord.totalDelay > that.options.delayThreshold) {
        const error = new Error();
        error.stack = message;
        throw error;
      } else {
        console.warn(message);
      }
    }

    checkError('timers', 'timer');
    checkError('fakeTimers', 'fake timer');
  }
};

export default reportLeaks;
