import type { ModernFakeTimers } from '@jest/fake-timers';
import { JestEnvironment } from '@jest/environment';
import initOriginal from './utils/initOriginal';

export interface TimerRecord {
  type: 'timeout' | 'interval' | 'fakeTimeout' | 'fakeInterval';
  delay: number;
  stack: string;
  testName: string;
}

export interface PromiseRecord {
  stack: string;
  testName: string;
}

export interface ConsoleRecord {
  method: keyof Console;
  stack: string;
  testName: string;
  message: string;
}

export interface LeakRecord {
  promises: Map<number | Promise<unknown>, PromiseRecord>;
  timers: Map<NodeJS.Timeout, TimerRecord>;
  console: ConsoleRecord[];
  totalDelay: number;
  fakeTimers: Map<number, TimerRecord>;
}
interface Clock {
  setTimeout: (callback: () => void, delay?: number) => number;
  setInterval: (callback: () => void, delay?: number) => number;
  clearTimeout: (timeoutId: number) => void;
  clearInterval: (intervalId: number) => void;
}
export interface FakeTimers extends Omit<ModernFakeTimers, '_fakeTimers'> {
  _fakeTimers: {
    install: (config: unknown) => Clock;
  };
  _clock: {
    timers: Record<string, unknown>;
  };
}

export type TimerIsolation = 'afterEach' | 'immediate';

export type OnError = boolean | 'throw' | 'warn';

export type ThrowOrWarn = 'throw' | 'warn';

export type Patch = 'async_hooks' | 'promise';

export interface ConsoleOptions {
  onError: ThrowOrWarn;
  methods: Array<keyof Console>;
  ignore: Array<string | RegExp>;
}

export type NormalizedConsoleOptions = false | ConsoleOptions;

export interface NormalizedOptions {
  report: {
    console: NormalizedConsoleOptions;
    timers: OnError;
    fakeTimers: OnError;
    promises:
      | false
      | {
          onError: ThrowOrWarn;
          patch: Patch;
        };
  };
  delayThreshold: number;
  timerIsolation: TimerIsolation;
  clearTimers: boolean;
}

export type RawConsoleOptions =
  | boolean
  | {
      onError?: ThrowOrWarn;
      methods?: Array<keyof Console>;
      ignore?: string | RegExp | Array<string | RegExp>;
    };

export type RawPromise =
  | boolean
  | {
      onError?: ThrowOrWarn;
      patch?: Patch;
    };

export interface RawOptions {
  report?: {
    console?: RawConsoleOptions;
    timers?: OnError;
    fakeTimers?: OnError;
    promises?: RawPromise;
  };
  delayThreshold?: number;
  timerIsolation?: TimerIsolation;
  clearTimers?: boolean;
}

export interface AggregatedReport {
  testPath: string;
  promises: number;
  timers: number;
  fakeTimers: number;
  console: number;
  totalDelay: number;
}
export interface JestDoctorEnvironment {
  global: JestEnvironment['global'];
  fakeTimersModern: ModernFakeTimers | null;
  original: ReturnType<typeof initOriginal>;
  currentTestName: string;
  leakRecords: Map<string, LeakRecord>;
  promiseOwner: Map<number, string>;
  currentAfterEachCount: number;
  options: NormalizedOptions;
  aggregatedReport: AggregatedReport;
}
