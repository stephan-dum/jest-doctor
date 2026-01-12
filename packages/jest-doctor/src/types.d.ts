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
  message: unknown[];
}

export interface LeakRecord {
  promise: Map<number, PromiseRecord>;
  interval: Map<NodeJS.Timeout, TimerRecord>;
  timeout: Map<NodeJS.Timeout, TimerRecord>;
  console: ConsoleRecord[];
  totalDelay: number;
  fakeTimeout: Map<number, TimerRecord>;
  fakeInterval: Map<number, TimerRecord>;
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

export interface JestDoctorEnvironment {
  global: JestEnvironment['global'];
  fakeTimersModern: ModernFakeTimers | null;
  original: ReturnType<typeof initOriginal>;
  currentTestName: string;
  leakRecords: Map<string, LeakRecord>;
  promiseOwner: Map<number, string>;
  shouldCleanup: boolean;
  currentAfterEachCount: number;
}
