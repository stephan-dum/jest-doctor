import type { ModernFakeTimers } from '@jest/fake-timers';
import { JestEnvironment } from '@jest/environment';
import initOriginal from './utils/initOriginal.cjs';

export interface TimerRecord {
  type: 'timeout' | 'interval' | 'fakeTimeout' | 'fakeInterval';
  delay: number;
  stack: string;
  testName: string;
}

export interface PromiseRecord {
  stack: string;
  triggerAsyncId: number;
  testName: string;
}

export interface ConsoleRecord {
  method: keyof Console;
  stack: string;
  testName: string;
  message: string;
}

export interface LeakRecord {
  promises: Map<number, PromiseRecord>;
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

export type OnError = boolean | 'throw' | 'error';

export interface ConsoleOptions {
  onError: OnError;
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
  delayThreshold: number;
  timerIsolation: TimerIsolation;
  clearTimers: boolean;
}

export type RawConsoleOptions =
  | boolean
  | {
      onError?: 'throw' | 'warn';
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
  delayThreshold?: number;
  timerIsolation?: TimerIsolation;
  clearTimers?: boolean;
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
}
