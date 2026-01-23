import reportLeaks from './reportLeaks';
import type { JestDoctorEnvironment, LeakRecord } from '../types';

const aggregatedReport = {
  console: 0,
  promises: 0,
  timers: 0,
  fakeTimers: 0,
  processOutputs: 0,
  totalDelay: 0,
};
describe('console', () => {
  it('warns ', () => {
    const stderrWriteMock = jest.fn();
    const that = {
      aggregatedReport,
      original: {
        stderr: stderrWriteMock,
      },
      currentAfterEachCount: 0,
      options: {
        verbose: true,
        report: {
          timers: {
            onError: 'throw',
          },
          console: {
            onError: 'warn',
          },
          processOutputs: {},
        },
      },
    } as unknown as JestDoctorEnvironment;

    const leakReport = {
      promises: new Map(),
      timers: new Map(),
      fakeTimers: new Map(),
      processOutputs: [],
      totalDelay: 0,
      console: [
        {
          method: 'log',
          stack: 'my stack text',
        },
      ],
    } as LeakRecord;

    reportLeaks(that, leakReport);

    expect(leakReport.console.length).toEqual(0);

    expect(stderrWriteMock).toHaveBeenCalledWith(
      expect.stringContaining('console output(s) found'),
    );
  });

  it('throws ', () => {
    const that = {
      aggregatedReport,
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
      processOutputs: [],
      totalDelay: 0,
      console: [
        {
          method: 'log',
          stack: 'my stack text',
        },
      ],
    } as LeakRecord;

    try {
      reportLeaks(that, leakReport);
    } catch (error) {
      expect((error as Error).stack).toContain('console output(s) found');
    }

    expect(leakReport.console.length).toEqual(0);
  });
});

describe('processOutputs', () => {
  it('warns ', () => {
    const stderrWriteMock = jest.fn();
    const that = {
      aggregatedReport,
      original: {
        stderr: stderrWriteMock,
      },
      currentAfterEachCount: 0,
      options: {
        verbose: true,
        report: {
          timers: {
            onError: 'throw',
          },
          processOutputs: {
            onError: 'warn',
          },
          console: {},
        },
      },
    } as unknown as JestDoctorEnvironment;

    const leakReport = {
      promises: new Map(),
      timers: new Map(),
      fakeTimers: new Map(),
      processOutputs: [
        {
          stack: 'my stack text',
          method: 'stderr',
        },
      ],
      totalDelay: 0,
      console: [],
    } as LeakRecord;

    reportLeaks(that, leakReport);

    expect(leakReport.processOutputs.length).toEqual(0);

    expect(stderrWriteMock).toHaveBeenCalledWith(
      expect.stringContaining('process output(s) found'),
    );
  });
});

describe('checkError', () => {
  it('warns ', () => {
    const stderrWriteMock = jest.fn();
    const that = {
      aggregatedReport,
      original: {
        stderr: stderrWriteMock,
      },
      options: {
        report: {
          promises: {
            onError: 'warn',
          },
          console: {},
          processOutputs: {},
          timers: {},
        },
      },
    } as unknown as JestDoctorEnvironment;

    const leakReport = {
      promises: new Map([
        [
          Promise.resolve(),
          {
            parentAsyncId: 0,
            asyncId: 1,
            testName: 'test',
            stack: 'my stack text',
          },
        ],
      ]),
      timers: new Map(),
      fakeTimers: new Map(),
      console: [],
      processOutputs: [],
      totalDelay: 0,
    } as LeakRecord;

    reportLeaks(that, leakReport);

    expect(leakReport.promises.size).toEqual(0);
    expect(stderrWriteMock).toHaveBeenCalledWith(
      expect.stringContaining('open promise(s) found'),
    );
  });
  it('throws ', () => {
    const stderrWriteMock = jest.fn();
    const that = {
      aggregatedReport,
      original: {
        stderr: stderrWriteMock,
      },
      currentAfterEachCount: 0,
      options: {
        verbose: true,
        report: {
          promises: {
            onError: 'throw',
          },
          console: {},
          processOutputs: {},
          timers: {},
        },
      },
    } as unknown as JestDoctorEnvironment;

    const leakReport = {
      promises: new Map([
        [
          Promise.resolve(),
          {
            parentAsyncId: 0,
            asyncId: 1,
            testName: 'test',
            stack: 'my stack text',
          },
        ],
      ]),
      timers: new Map(),
      fakeTimers: new Map(),
      console: [],
      processOutputs: [],
      totalDelay: 0,
    } as LeakRecord;

    try {
      reportLeaks(that, leakReport);
    } catch (error) {
      expect((error as Error).stack).toContain('open promise(s) found');
    }

    expect(leakReport.promises.size).toEqual(0);

    expect(stderrWriteMock).toHaveBeenCalledTimes(1);
  });
});

describe('totalDelay', () => {
  it('warns ', () => {
    const stderrWriteMock = jest.fn();
    const that = {
      aggregatedReport,
      original: {
        stderr: stderrWriteMock,
      },
      currentAfterEachCount: 0,
      options: {
        report: {
          console: {},
          processOutputs: {},
          timers: {},
        },
        delayThreshold: 100,
      },
    } as unknown as JestDoctorEnvironment;

    const leakReport = {
      promises: new Map(),
      timers: new Map(),
      fakeTimers: new Map(),
      console: [],
      processOutputs: [],
      totalDelay: 10,
    } as LeakRecord;

    reportLeaks(that, leakReport);

    expect(stderrWriteMock).toHaveBeenCalledWith(
      expect.stringContaining('with total delay of'),
    );
  });
  it('throws ', () => {
    const that = {
      aggregatedReport,
      currentAfterEachCount: 0,
      options: {
        report: {
          console: {},
          processOutputs: {},
          timers: {},
        },
        delayThreshold: 0,
      },
    } as unknown as JestDoctorEnvironment;

    const leakReport = {
      promises: new Map(),
      timers: new Map(),
      fakeTimers: new Map(),
      console: [],
      processOutputs: [],
      totalDelay: 10,
    } as LeakRecord;

    try {
      reportLeaks(that, leakReport);
    } catch (error) {
      expect((error as Error).stack).toContain('with total delay of');
    }
  });
});

describe('timers', () => {
  it('warns ', () => {
    const stderrWriteMock = jest.fn();
    const that = {
      aggregatedReport,
      currentAfterEachCount: 0,
      original: {
        stderr: stderrWriteMock,
      },
      options: {
        verbose: true,
        report: {
          promises: {
            onError: 'warn',
          },
          console: {},
          processOutputs: {},
          timers: {},
        },
      },
    } as unknown as JestDoctorEnvironment;

    const leakReport = {
      promises: new Map(),
      timers: new Map([
        [
          1 as unknown as NodeJS.Timeout,
          {
            type: 'timeout',
            delay: 0,
            stack: 'my stack text',
            isAllowed: true,
          },
        ],
      ]),
      fakeTimers: new Map([
        [
          2,
          {
            type: 'timeout',
            delay: 0,
            stack: 'my stack text',
          },
        ],
      ]),
      console: [],
      processOutputs: [],
      totalDelay: 0,
    } as LeakRecord;

    reportLeaks(that, leakReport);

    expect(leakReport.promises.size).toEqual(0);
    expect(stderrWriteMock).toHaveBeenCalledWith(
      expect.stringContaining('open timer(s) found'),
    );
  });
});
