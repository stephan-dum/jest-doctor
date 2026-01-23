import cleanupAfterTest from './cleanupAfterTest';
import { JestDoctorEnvironment, LeakRecord } from '../types';

it('should clean all fake timers', () => {
  const clearTimeoutMock = jest.fn();
  const clearIntervalMock = jest.fn();
  const that = {
    currentAfterEachCount: 0,
    leakRecords: new Map([['test', {}]]),
    options: {
      clearTimers: true,
    },
    original: {
      clearTimeout: clearTimeoutMock,
      clearInterval: clearIntervalMock,
    },
    fakeTimers: {
      _fakingTime: true,
      clearAllTimers: jest.fn(),
    },
    fakeTimersModern: {
      _fakingTime: true,
      clearAllTimers: jest.fn(),
    },
  } as unknown as JestDoctorEnvironment;

  const leakRecord = {
    timers: new Map([
      [1, { type: 'timeout' }],
      [2, { type: 'setInterval' }],
    ]),
  } as unknown as LeakRecord;

  cleanupAfterTest(that, leakRecord, 'test');

  expect(that.original.clearInterval).toHaveBeenCalledTimes(1);
  expect(that.original.clearTimeout).toHaveBeenCalledTimes(1);
  expect(clearTimeoutMock).toHaveBeenCalledTimes(1);
  expect(clearIntervalMock).toHaveBeenCalledTimes(1);
});
