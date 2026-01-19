import type {
  LeakRecord,
  ConsoleOptions,
  JestDoctorEnvironment,
} from '../types';
import console from 'node:console';
import chalk from 'chalk';

const reportLeaks = (that: JestDoctorEnvironment, leakRecord: LeakRecord) => {
  const checkError = (
    property: 'promises' | 'timers' | 'fakeTimers',
    label: string,
  ) => {
    if (leakRecord[property].size) {
      const message = [
        chalk.red(`${leakRecord[property].size} open ${label}(s) found!`),
        leakRecord[property].values().next().value?.stack,
      ].join('\n');

      const option = that.options.report[property];
      if (option === 'throw') {
        const error = new Error();
        error.stack = message;
        throw error;
      } else {
        console.warn(message);
      }
    }
  };

  that.aggregatedReport.console += leakRecord.console.length;
  that.aggregatedReport.promises += leakRecord.promises.size;

  if (that.currentAfterEachCount === 0) {
    if (that.options.report.timers) {
      that.aggregatedReport.timers += leakRecord.timers.size;
    }

    that.aggregatedReport.fakeTimers += leakRecord.fakeTimers.size;
    that.aggregatedReport.totalDelay += leakRecord.totalDelay;
  }

  if (that.options.verbose) {
    const messages: string[] = [];

    const addLeak = (leak: { stack: string }) => {
      messages.push(leak.stack);
    };
    leakRecord.promises.forEach(addLeak);
    leakRecord.timers.forEach(addLeak);
    leakRecord.fakeTimers.forEach(addLeak);
    leakRecord.console.forEach(addLeak);

    if (messages.length) {
      console.log(messages.join('\n'));
    }
  }

  try {
    if (leakRecord.console.length) {
      const message = [
        chalk.red(`${leakRecord.console.length} console output found!`),
        leakRecord.console[0].stack,
      ].join('\n');

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
        const message = chalk.red(
          `setTimeout / setInterval with total delay of ${leakRecord.totalDelay}ms found, use fake timers instead!`,
        );

        if (leakRecord.totalDelay > that.options.delayThreshold) {
          const error = new Error();
          error.stack = message;
          throw error;
        } else {
          console.warn(message);
        }
      }

      if (that.options.report.timers) {
        checkError('timers', 'timer');
      }

      checkError('fakeTimers', 'fake timer');
    }
  } finally {
    leakRecord.console = [];
    leakRecord.promises.clear();
  }
};

export default reportLeaks;
