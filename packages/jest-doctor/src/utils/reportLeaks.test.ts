import reportLeaks from './reportLeaks.cjs';
import { JestDoctorEnvironment, LeakRecord } from '../types';
import console from 'node:console';

jest.mock('node:console', () => ({
  default: {
    warn: jest.fn(),
  },
  __esModule: true,
}));

describe('console', () => {
  it('warns ', () => {
    const that = {
      options: {
        report: {
          console: {
            onError: 'warn',
          },
        },
      },
    } as unknown as JestDoctorEnvironment;

    const leakReport = {
      promises: new Map(),
      timers: new Map(),
      fakeTimers: new Map(),
      console: [
        {
          message: 'hello text',
          stack: 'my stack text',
        },
      ],
    } as LeakRecord;

    reportLeaks(that, leakReport);

    expect(leakReport.console.length).toEqual(0);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('console output found'),
    );
  });

  it('throws ', () => {
    const that = {
      options: {
        report: {
          console: {
            onError: 'throw',
          },
        },
      },
    } as unknown as JestDoctorEnvironment;

    const leakReport = {
      promises: new Map(),
      timers: new Map(),
      fakeTimers: new Map(),
      console: [
        {
          message: 'hello text',
          stack: 'my stack text',
        },
      ],
    } as LeakRecord;

    try {
      reportLeaks(that, leakReport);
    } catch (error) {
      expect((error as Error).stack).toContain('console output found');
    }

    expect(leakReport.console.length).toEqual(0);
  });
});

describe('checkError', () => {
  it('warns ', () => {
    const that = {
      options: {
        report: {
          promises: 'warn',
        },
      },
    } as unknown as JestDoctorEnvironment;

    const leakReport = {
      promises: new Map([
        [
          123,
          {
            triggerAsyncId: 0,
            testName: 'test',
            stack: 'my stack text',
          },
        ],
      ]),
      timers: new Map(),
      fakeTimers: new Map(),
      console: [],
      totalDelay: 0,
    } as LeakRecord;

    reportLeaks(that, leakReport);

    expect(leakReport.promises.size).toEqual(0);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('open promise(s) found'),
    );
  });
  it('throws ', () => {
    const that = {
      options: {
        report: {
          promises: 'throw',
        },
      },
    } as unknown as JestDoctorEnvironment;

    const leakReport = {
      promises: new Map([
        [
          123,
          {
            triggerAsyncId: 0,
            testName: 'test',
            stack: 'my stack text',
          },
        ],
      ]),
      timers: new Map(),
      fakeTimers: new Map(),
      console: [],
      totalDelay: 0,
    } as LeakRecord;

    try {
      reportLeaks(that, leakReport);
    } catch (error) {
      expect((error as Error).stack).toContain('open promise(s) found');
    }

    expect(leakReport.promises.size).toEqual(0);
  });
});

describe('totalDelay', () => {
  it('warns ', () => {
    const that = {
      currentAfterEachCount: 0,
      options: {
        delayThreshold: 100,
      },
    } as unknown as JestDoctorEnvironment;

    const leakReport = {
      promises: new Map(),
      timers: new Map(),
      fakeTimers: new Map(),
      console: [],
      totalDelay: 10,
    } as LeakRecord;

    reportLeaks(that, leakReport);

    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('with total delay of'),
    );
  });
  it('throws ', () => {
    const that = {
      currentAfterEachCount: 0,
      options: {
        delayThreshold: 0,
      },
    } as unknown as JestDoctorEnvironment;

    const leakReport = {
      promises: new Map(),
      timers: new Map(),
      fakeTimers: new Map(),
      console: [],
      totalDelay: 10,
    } as LeakRecord;

    try {
      reportLeaks(that, leakReport);
    } catch (error) {
      expect((error as Error).stack).toContain('with total delay of');
    }
  });
});
