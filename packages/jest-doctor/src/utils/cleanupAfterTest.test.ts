import cleanupAfterTest from './cleanupAfterTest';
import { JestDoctorEnvironment, LeakRecord } from '../types';

it('should clean all fake timers', () => {
  const clearTimeoutMock = jest.fn();
  const clearIntervalMock = jest.fn();
  const clearImmediateMock = jest.fn();

  const that = {
    currentAfterEachCount: 0,
    leakRecords: new Map([['test', {}]]),
    options: {
      clearTimers: true,
    },
    original: {
      timer: {
        clearTimeout: clearTimeoutMock,
        clearInterval: clearIntervalMock,
        clearImmediate: clearImmediateMock,
      },
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
      [2, { type: 'interval' }],
      [3, { type: 'immediate' }],
    ]),
  } as unknown as LeakRecord;

  cleanupAfterTest(that, leakRecord, 'test');

  expect(that.original.timer.clearInterval).toHaveBeenCalledTimes(1);
  expect(that.original.timer.clearTimeout).toHaveBeenCalledTimes(1);
  expect(that.original.timer.clearImmediate).toHaveBeenCalledTimes(1);
  expect(clearTimeoutMock).toHaveBeenCalledTimes(1);
  expect(clearIntervalMock).toHaveBeenCalledTimes(1);
  expect(clearImmediateMock).toHaveBeenCalledTimes(1);
});
