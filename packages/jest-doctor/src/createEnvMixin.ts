// noinspection JSPotentiallyInvalidUsageOfThis

import type {
  EnvironmentContext,
  JestEnvironment,
  JestEnvironmentConfig,
} from '@jest/environment';

import path from 'node:path';
import { writeFileSync } from 'node:fs';
import type { AsyncHook } from 'node:async_hooks';

import type {
  JestDoctorEnvironment,
  LeakRecord,
  NormalizedOptions,
} from './types';
import patchConsole from './patch/console';
import initOriginal from './utils/initOriginal';
import patchFakeTimers from './patch/fakeTimers';
import { MAIN_THREAD } from './consts';
import timers from './patch/timers';
import patchIt from './patch/it';
import createAsyncHookDetector from './patch/createAsyncHookDetector';
import createAsyncHookCleaner from './patch/createAsyncHookCleaner';
import reportLeaks from './utils/reportLeaks';
import cleanupAfterTest from './utils/cleanupAfterTest';
import initLeakRecord from './utils/initLeakRecord';
import patchHook from './patch/hook';
import getAllAfterEach from './utils/getAllAfterEach';
import normalizeOptions from './utils/normalizeOptions';
import getReporterTmpDir from './utils/getReporterTmpDir';
import { Circus } from '@jest/types';
import type { LegacyFakeTimers, ModernFakeTimers } from '@jest/fake-timers';
import type { ModuleMocker } from 'jest-mock';
import type { Context } from 'node:vm';
import patchPromiseConcurrency from './patch/promiseConcurrency';
import patchProcessOutput from './patch/processOutput';

interface JestDoctor {
  handleEvent?(
    event: Circus.AsyncEvent | Circus.SyncEvent,
    state: Circus.State,
  ): Promise<void>;
  global: JestEnvironment['global'];
  fakeTimers: LegacyFakeTimers<unknown> | null;
  fakeTimersModern: ModernFakeTimers | null;
  moduleMocker: ModuleMocker | null;
  getVmContext: () => Context | null;
  exportConditions: (() => Array<string>) | undefined;
  setup(): Promise<void>;
  teardown(): Promise<void>;
  handleTestEvent?: Circus.EventHandler;
}

export interface JestDoctorConstructor {
  new (config: JestEnvironmentConfig, context: EnvironmentContext): JestDoctor;
}

const createEnvMixin = <EnvironmentConstructor extends JestDoctorConstructor>(
  Environment: EnvironmentConstructor,
) => {
  // @ts-expect-error strange ts rule where constructor arguments should be any[] where again TypeScript complains
  return class Base extends Environment implements JestDoctorEnvironment {
    public currentTestName: string = MAIN_THREAD;
    public readonly leakRecords = new Map<string, LeakRecord>();
    public readonly original = initOriginal();
    public readonly promiseOwner = new Map<number, string>();
    public readonly asyncHookDetector?: AsyncHook;
    public readonly asyncHookCleaner?: AsyncHook;
    public readonly options: NormalizedOptions;
    public seenTearDown = false;
    public currentAfterEachCount = 0;
    public readonly reporterTmpDir: string;
    public readonly testPath: string;
    public readonly aggregatedReport;
    public tearDownError?: Error;
    public asyncIdToPromise = new Map<number, Promise<unknown>>();
    public asyncRoot = 0;
    public asyncIdToParentId = new Map<number, number>();

    constructor(config: JestEnvironmentConfig, context: EnvironmentContext) {
      process.stderr.write(JSON.stringify(config, null, 2));
      super(config, context);

      this.testPath = context.testPath.replace(/\W/g, '_');
      this.aggregatedReport = {
        testPath: context.testPath,
        promises: 0,
        timers: 0,
        fakeTimers: 0,
        console: 0,
        totalDelay: 0,
        processOutputs: 0,
      };

      const tmpDir = getReporterTmpDir(
        config.projectConfig.reporters || config.globalConfig.reporters,
      );

      this.reporterTmpDir = tmpDir
        ? path.join(
            tmpDir,
            config.globalConfig.seed.toString(),
            this.testPath + 'json',
          )
        : '';

      this.options = normalizeOptions(
        config.projectConfig.testEnvironmentOptions,
      );

      initLeakRecord(this, MAIN_THREAD);

      if (this.options.report.promises) {
        this.asyncHookCleaner = createAsyncHookCleaner(this);
        this.asyncHookDetector = createAsyncHookDetector(this);
      }
    }

    async setup() {
      await super.setup();

      const report = this.options.report;

      if (report.fakeTimers) {
        patchFakeTimers(this);
      }

      // always patch to be able to clean them
      timers(this);

      if (report.console) {
        patchConsole(this, report.console);
      }
      if (report.processOutputs) {
        patchProcessOutput(this, report.processOutputs);
      }

      if (report.promises) {
        patchPromiseConcurrency(this);
      }
    }

    // unfortunately @jest/types doesn't export the necessary types,
    // so it breaks if public types are exposed and build with declaration enabled
    async handleEvent(event: unknown, state: unknown): Promise<void> {
      const circusEvent = event as Circus.AsyncEvent;
      const circusState = state as Circus.State;

      if (circusEvent.name === 'test_start') {
        if (this.options.timerIsolation === 'afterEach') {
          this.currentAfterEachCount = getAllAfterEach(circusEvent.test.parent);
        }
      } else if (circusEvent.name === 'teardown') {
        // the detector needs to be disabled here to avoid the teardown promise polluting the report
        this.asyncHookDetector?.disable();
        this.seenTearDown = true;
      } else if (circusEvent.name === 'setup') {
        this.asyncHookCleaner?.enable();
        this.asyncHookDetector?.enable();

        patchIt(this, circusEvent.runtimeGlobals);
        patchHook(this, 'beforeEach', circusEvent.runtimeGlobals);
        patchHook(this, 'beforeAll', circusEvent.runtimeGlobals);
        patchHook(this, 'afterEach', circusEvent.runtimeGlobals);
        patchHook(this, 'afterAll', circusEvent.runtimeGlobals);
      }

      await super.handleEvent?.(circusEvent, circusState);
    }
    handleTestEvent: JestEnvironment['handleTestEvent'] = async (
      event,
      state,
    ) => {
      return this.handleEvent(event, state);
    };

    async teardown() {
      if (this.tearDownError) {
        // if its a retry, rethrow
        throw this.tearDownError;
      }
      await super.teardown();
      const leakRecord = this.leakRecords.get(MAIN_THREAD) as LeakRecord;

      try {
        // in case jest discovers an error, all following events will be skipped
        // and teardown is executed immediately
        if (this.seenTearDown) {
          reportLeaks(this, leakRecord);
        }
      } catch (error) {
        // it can happen that jest has a retry which leads, to even retrying teardown
        // to preserve the state and fast-forward, the error is saved and rethrow
        this.tearDownError = error as Error;
        throw error;
      } finally {
        cleanupAfterTest(this, leakRecord, MAIN_THREAD);

        process.stdout.write = this.original.stdout;
        process.stderr.write = this.original.stderr;

        this.asyncHookCleaner?.disable();
        // this is added here for safety reasons,
        // because jest could abort and dont hit teardown event
        this.asyncHookDetector?.disable();

        const hasLeak =
          this.aggregatedReport.promises +
          this.aggregatedReport.timers +
          this.aggregatedReport.fakeTimers +
          this.aggregatedReport.console +
          this.aggregatedReport.processOutputs +
          this.aggregatedReport.totalDelay;

        if (this.reporterTmpDir && hasLeak) {
          // needs to be sync or will be terminated by jest when an error occurs
          writeFileSync(
            this.reporterTmpDir,
            JSON.stringify(this.aggregatedReport),
          );
        }
      }
    }
  };
};

export default createEnvMixin;
