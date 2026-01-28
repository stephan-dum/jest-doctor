import normalizeOptions from './normalizeOptions';
import { RawOptions } from '../types';

describe('normalize console', () => {
  it('should normalize console if empty object', () => {
    const result = normalizeOptions({
      report: {
        console: {},
      },
    });

    expect(result.report.console).toEqual({
      onError: 'throw',
      methods: ['log', 'warn', 'error', 'info', 'debug'],
      ignoreStack: [],
      ignoreMessage: [],
    });
  });

  it('should normalize console is false', () => {
    const result = normalizeOptions({
      report: {
        console: false,
      },
    });

    expect(result.report.console).toEqual(false);
  });

  it('should normalize console if ignore is an array', () => {
    const result = normalizeOptions({
      report: {
        console: {
          ignoreStack: ['test'],
          ignoreMessage: ['text'],
        },
      },
    });

    expect(result.report.console).toMatchObject({
      onError: 'throw',
      methods: ['log', 'warn', 'error', 'info', 'debug'],
      ignoreStack: ['test'],
      ignoreMessage: ['text'],
    });
  });

  it('should normalize console if ignore is a string', () => {
    const result = normalizeOptions({
      report: {
        console: {
          ignoreStack: 'test',
        },
      },
    });

    expect(result.report.console).toMatchObject({
      onError: 'throw',
      methods: ['log', 'warn', 'error', 'info', 'debug'],
      ignoreStack: ['test'],
    });
  });
});
describe('timers', () => {
  it('should normalize if timers false', () => {
    const result = normalizeOptions({
      report: {
        timers: false,
      },
    });

    expect(result.report.timers).toEqual(false);
  });
});

it('should throw on invalid input', () => {
  expect(() =>
    normalizeOptions({
      report: {
        timers: true,
        console: {
          methods: ['wrongMethod'],
          ignore: [123],
        },
        promise: 'wrong',
      },
    } as unknown as RawOptions),
  ).toThrow();
});

it('should normalize if report is undefined', () => {
  const result = normalizeOptions();

  expect(result).toMatchObject({
    report: {
      timers: {
        onError: 'throw',
        ignoreStack: [],
      },
    },
    timerIsolation: 'afterEach',
  });
});
