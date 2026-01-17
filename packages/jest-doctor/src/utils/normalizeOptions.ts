import {
  NormalizedOptions,
  TimerIsolation,
  NormalizedConsoleOptions,
  OnError,
  RawOptions,
  RawConsoleOptions,
  ThrowOrWarn,
  RawPromise,
  Patch,
} from '../types';

const DEFAULTS = {
  report: {
    console: {
      onError: 'throw' as ThrowOrWarn,
      methods: ['log', 'warn', 'error', 'info', 'debug'] as Array<
        keyof Console
      >,
      ignore: [],
    },
    timers: 'throw' as OnError,
    fakeTimers: 'throw' as OnError,
    promises: {
      onError: 'throw' as ThrowOrWarn,
      patch: 'async_hooks' as Patch,
    },
  },
  delayThreshold: 0,
  timerIsolation: 'afterEach' as TimerIsolation,
  clearTimers: true,
};

const normalizeConsole = (
  rawConsole?: RawConsoleOptions,
): NormalizedConsoleOptions => {
  if (rawConsole === undefined || rawConsole === true) {
    return DEFAULTS.report.console;
  }

  if (typeof rawConsole === 'object') {
    return {
      onError: rawConsole.onError ?? DEFAULTS.report.console.onError,
      methods: rawConsole.methods ?? DEFAULTS.report.console.methods,
      ignore: Array.isArray(rawConsole.ignore)
        ? rawConsole.ignore
        : rawConsole.ignore === undefined
          ? []
          : [rawConsole.ignore],
    };
  }

  return false;
};
const normalizePromise = (rawPromise?: RawPromise) => {
  if (rawPromise === undefined || rawPromise === true) {
    return DEFAULTS.report.promises;
  }

  if (typeof rawPromise === 'object') {
    return {
      onError: rawPromise.onError ?? DEFAULTS.report.promises.onError,
      patch: rawPromise.patch ?? DEFAULTS.report.promises.patch,
    };
  }

  return false;
};
export function normalizeOptions(raw: RawOptions): NormalizedOptions {
  const report = raw.report ?? {};

  return {
    report: {
      console: normalizeConsole(report.console),
      timers: report.timers ?? DEFAULTS.report.timers,
      fakeTimers: report.fakeTimers ?? DEFAULTS.report.fakeTimers,
      promises: normalizePromise(report.promises),
    },
    delayThreshold: raw.delayThreshold ?? DEFAULTS.delayThreshold,
    timerIsolation: raw.timerIsolation ?? DEFAULTS.timerIsolation,
    clearTimers: raw.clearTimers ?? DEFAULTS.clearTimers,
  };
}

export default normalizeOptions;
