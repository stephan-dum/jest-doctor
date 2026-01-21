import type {
  LeakRecord,
  ConsoleOptions,
  JestDoctorEnvironment,
  OutputOptions,
  ThrowOrWarn,
} from '../types';

import chalk from 'chalk';

const reportLeaks = (that: JestDoctorEnvironment, leakRecord: LeakRecord) => {
  const report = that.options.report;

  const warnOrThrow = (condition: boolean, message: string) => {
    if (condition) {
      const error = new Error();
      error.stack = message;
      throw error;
    } else {
      that.original.stderr(`\n` + chalk.yellow(message) + '\n');
    }
  };
  const checkErrorArray = (
    result: { stack: string }[],
    label: string,
    onError: ThrowOrWarn,
  ) => {
    if (result.length) {
      const message = [
        chalk.red(`${result.length} ${label} found!`),
        result[0].stack,
      ].join('\n');

      warnOrThrow(onError === 'throw', message);
    }
  };

  const checkErrorMap = (
    property: 'promises' | 'timers' | 'fakeTimers',
    label: string,
  ) => {
    if (leakRecord[property].size) {
      const message = [
        chalk.red(`${leakRecord[property].size} open ${label}(s) found!`),
        leakRecord[property].values().next().value?.stack,
      ].join('\n');

      const option = report[property];
      warnOrThrow(option && option.onError === 'throw', message);
    }
  };

  const accountAbleTimers = Array.from(
    leakRecord.timers.values().filter((timerRecord) => timerRecord.isAllowed),
  );

  that.aggregatedReport.processOutputs += leakRecord.processOutputs.length;
  that.aggregatedReport.console += leakRecord.console.length;
  that.aggregatedReport.promises += leakRecord.promises.size;

  if (that.currentAfterEachCount === 0) {
    if (that.options.report.timers) {
      that.aggregatedReport.timers += accountAbleTimers.length;
    }

    that.aggregatedReport.fakeTimers += leakRecord.fakeTimers.size;
    that.aggregatedReport.totalDelay += leakRecord.totalDelay;
  }

  if (that.options.verbose) {
    const logLeak = (
      label: string,
      message: string,
      property: keyof typeof report,
    ) => {
      if (message && report[property] && report[property].onError !== 'warn') {
        that.original.stderr(
          '\n' + chalk.red(label) + '\n' + chalk.red(message) + '\n',
        );
      }
    };

    leakRecord.promises.forEach(({ stack }) => {
      logLeak(`Open promise:`, stack, 'promises');
    });

    if (that.currentAfterEachCount === 0) {
      accountAbleTimers.forEach(({ stack }) => {
        logLeak(`Open timer:`, stack, 'timers');
      });
      leakRecord.fakeTimers.forEach(({ stack }) => {
        logLeak(`Open fake timer:`, stack, 'fakeTimers');
      });
    }

    leakRecord.console.forEach(({ stack }) => {
      logLeak(`Console output:`, stack, 'console');
    });
    leakRecord.processOutputs.forEach(({ stack }) => {
      logLeak(`Process output:`, stack, 'processOutputs');
    });
  }

  try {
    checkErrorArray(
      leakRecord.console,
      'console output(s)',
      (report.console as ConsoleOptions).onError,
    );
    checkErrorArray(
      leakRecord.processOutputs,
      'process output(s)',
      (report.processOutputs as OutputOptions).onError,
    );
    checkErrorMap('promises', 'promise');

    if (that.currentAfterEachCount === 0) {
      if (leakRecord.totalDelay) {
        const message = chalk.red(
          `setTimeout / setInterval with total delay of ${leakRecord.totalDelay}ms found, use fake timers instead!`,
        );

        warnOrThrow(
          leakRecord.totalDelay > that.options.delayThreshold,
          message,
        );
      }

      if (report.timers) {
        checkErrorArray(
          accountAbleTimers,
          'open timer(s)',
          report.timers.onError,
        );
      }

      checkErrorMap('fakeTimers', 'fake timer');
    }
  } finally {
    leakRecord.console = [];
    leakRecord.processOutputs = [];
    leakRecord.promises.clear();
  }
};

export default reportLeaks;
