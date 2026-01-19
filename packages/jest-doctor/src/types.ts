import type { ModernFakeTimers } from '@jest/fake-timers';
import { JestEnvironment } from '@jest/environment';
import initOriginal from './utils/initOriginal';
import type { AsyncHook } from 'node:async_hooks';

export interface TimerRecord {
  type: 'timeout' | 'interval' | 'fakeTimeout' | 'fakeInterval';
  delay: number;
  stack: string;
  testName: string;
}

export interface PromiseRecord {
  stack: string;
  testName: string;
  asyncId: number;
  parentAsyncId: number;
}

export interface ConsoleRecord {
  method: keyof Console;
  stack: string;
  testName: string;
  message: string;
}

export interface LeakRecord {
  promises: Map<Promise<unknown>, PromiseRecord>;
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

export type OnError = false | 'throw' | 'warn';

export type ThrowOrWarn = 'throw' | 'warn';

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
    promises: OnError;
  };
  verbose: boolean;
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

export interface RawOptions {
  report?: {
    console?: RawConsoleOptions;
    timers?: OnError;
    fakeTimers?: OnError;
    promises?: OnError;
  };
  verbose?: boolean;
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
  asyncIdToPromise: Map<number, Promise<unknown>>;
  asyncHookDetector?: AsyncHook;
}
