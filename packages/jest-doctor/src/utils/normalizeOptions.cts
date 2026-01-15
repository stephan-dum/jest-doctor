import type {
  NormalizedOptions,
  TimerIsolation,
  NormalizedConsoleOptions,
  OnError,
  RawOptions,
  RawConsoleOptions,
} from '../types';

const DEFAULTS = {
  report: {
    console: {
      onError: 'throw' as OnError,
      methods: ['log', 'warn', 'error', 'info', 'debug'] as Array<
        keyof Console
      >,
      ignore: [],
    },
    timers: 'throw' as OnError,
    fakeTimers: 'throw' as OnError,
    promises: 'throw' as OnError,
  },
  delayThreshold: 100,
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
      onError:
        (rawConsole.onError as OnError) ?? DEFAULTS.report.console.onError,
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
export function normalizeOptions(raw: RawOptions): NormalizedOptions {
  const report = raw.report ?? {};

  return {
    report: {
      console: normalizeConsole(report.console),
      timers: report.timers ?? DEFAULTS.report.timers,
      fakeTimers: report.fakeTimers ?? DEFAULTS.report.fakeTimers,
      promises: report.promises ?? DEFAULTS.report.promises,
    },
    delayThreshold: raw.delayThreshold ?? DEFAULTS.delayThreshold,
    timerIsolation: raw.timerIsolation ?? DEFAULTS.timerIsolation,
    clearTimers: raw.clearTimers ?? DEFAULTS.clearTimers,
  };
}

export default normalizeOptions;
