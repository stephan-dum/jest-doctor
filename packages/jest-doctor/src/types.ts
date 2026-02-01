import { JestEnvironment } from '@jest/environment';
import initOriginal from './utils/initOriginal';
import type { AsyncHook } from 'node:async_hooks';
import type {
  beforeEach,
  beforeAll,
  it,
  test,
  afterEach,
  afterAll,
} from '@jest/globals';
import jsdom from 'jsdom';

export interface RuntimeHooks {
  beforeAll: typeof beforeAll;
  beforeEach: typeof beforeEach;
  afterEach: typeof afterEach;
  afterAll: typeof afterAll;
}

export interface RuntimeGlobals extends RuntimeHooks {
  it: typeof it;
  test: typeof test;
}

export interface TimerRecord {
  type: string;
  delay?: number;
  stack: string;
  isAllowed?: boolean;
}

export interface PromiseRecord {
  stack: string;
  asyncId: number;
  parentAsyncId: number;
}

export interface ConsoleRecord {
  method: keyof Console;
  stack: string;
}

export interface OutputRecord {
  method: 'stdout' | 'stderr';
  stack: string;
}
interface DOMListenerRecord {
  event: string;
  listener: (...args: unknown[]) => void;
  options: { capture?: boolean } | false | undefined;
  stack: string;
}

export interface LeakRecord {
  promises: Map<Promise<unknown>, PromiseRecord>;
  timers: Map<NodeJS.Timeout | NodeJS.Immediate, TimerRecord>;
  console: ConsoleRecord[];
  processOutputs: OutputRecord[];
  totalDelay: number;
  fakeTimers: Map<number | NodeJS.Timeout | NodeJS.Immediate, TimerRecord>;
  domListeners: DOMListenerRecord[];
}

export type TimerIsolation = 'afterEach' | 'immediate';

export type ThrowOrWarn = 'throw' | 'warn';

export type IsIgnored = Array<string | RegExp>;

type RawIgnore = string | RegExp | Array<string | RegExp>;

type ConsoleAddition = {
  methods: Array<keyof Console>;
  ignoreMessage: IsIgnored;
};

type OutputAddition = {
  methods: Array<'stderr' | 'stdout'>;
  ignoreMessage: IsIgnored;
};

export type ReportOptions<Type = object> = {
  onError: ThrowOrWarn;
  ignoreStack: IsIgnored;
} & Type;

export type ConsoleOptions = ReportOptions<ConsoleAddition>;

export type OutputOptions = ReportOptions<OutputAddition>;

type NormalizedReportOptions<Type = object> = false | ReportOptions<Type>;

export interface NormalizedOptions {
  report: {
    console: NormalizedReportOptions<ConsoleAddition>;
    processOutputs: NormalizedReportOptions<OutputAddition>;
    timers: NormalizedReportOptions;
    fakeTimers: NormalizedReportOptions;
    promises: NormalizedReportOptions;
    domListeners: NormalizedReportOptions;
  };
  verbose: boolean;
  delayThreshold: number;
  timerIsolation: TimerIsolation;
  clearTimers: boolean;
}

type RawConsoleAddition = {
  methods?: Array<keyof Console>;
  ignoreMessage?: RawIgnore;
};

type RawOutputAddition = {
  methods?: Array<'stderr' | 'stdout'>;
  ignoreMessage?: RawIgnore;
};

type RawReportOptions<Type = object> =
  | false
  | ({
      onError?: ThrowOrWarn;
      ignoreStack?: RawIgnore;
    } & Type);

export interface RawOptions {
  report?: {
    console?: RawReportOptions<RawConsoleAddition>;
    processOutputs?: RawReportOptions<RawOutputAddition>;
    timers?: RawReportOptions;
    fakeTimers?: RawReportOptions;
    promises?: RawReportOptions;
    domListeners?: RawReportOptions;
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
  processOutputs: number;
  domListeners: number;
  totalDelay: number;
}
export interface JestDoctorEnvironment extends JestEnvironment {
  global: JestEnvironment['global'];
  dom?: jsdom.JSDOM;
  original: ReturnType<typeof initOriginal>;
  currentTestName: string;
  leakRecords: Map<string, LeakRecord>;
  promiseOwner: Map<number, string>;
  currentAfterEachCount: number;
  options: NormalizedOptions;
  aggregatedReport: AggregatedReport;
  asyncIdToPromise: Map<number, Promise<unknown>>;
  asyncHookDetector?: AsyncHook;
  asyncRoot: number;
  asyncIdToParentId: Map<number, number>;
}
