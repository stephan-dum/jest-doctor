import { JestDoctorEnvironment } from '../types';
import { LeakRecord } from '../types';

const reportLeaks = (that: JestDoctorEnvironment, leakRecord: LeakRecord) => {
  const checkError = (
    property:
      | 'timeout'
      | 'promise'
      | 'interval'
      | 'fakeTimeout'
      | 'fakeInterval',
    label: string = property,
  ) => {
    if (leakRecord[property].size) {
      const error = new Error();
      error.stack = [
        `${leakRecord[property].size} open ${label}(s) found!`,
        leakRecord[property].values().next().value?.stack,
      ].join('\n');
      leakRecord[property].clear();
      throw error;
    }
  };

  if (leakRecord.console.length) {
    const error = new Error();
    error.stack = [
      `${leakRecord.console.length} console output found!`,
      ...leakRecord.console[0].message,
      leakRecord.console[0].stack,
    ].join('\n');
    leakRecord.console = [];
    throw error;
  }

  checkError('promise');

  if (that.currentAfterEachCount === 0) {
    if (leakRecord.totalDelay) {
      that.original.console.warn(
        `setTimeout / setInterval with total delay of ${leakRecord.totalDelay}ms found, use fake timers instead!`,
      );
    }

    checkError('timeout');
    checkError('interval');
    checkError('fakeTimeout', 'fake timeout');
    checkError('fakeInterval', 'fake interval');
  }
};

export default reportLeaks;
