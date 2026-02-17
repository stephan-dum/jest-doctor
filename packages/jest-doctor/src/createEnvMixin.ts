// noinspection JSPotentiallyInvalidUsageOfThis

import type {
  EnvironmentContext,
  JestEnvironment,
  JestEnvironmentConfig,
} from '@jest/environment';

import path from 'node:path';
import { writeFileSync } from 'node:fs';

import type {
  JestDoctorEnvironment,
  LeakRecord,
  NormalizedOptions,
} from './types';
import patchConsole from './patch/console';
import initOriginal from './utils/initOriginal';
import patchFakeTimers from './patch/fakeTimers';
import { MAIN_THREAD } from './consts';
import patchTimers from './patch/timers';
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
import patchPromiseConcurrency from './patch/promiseConcurrency';
import patchProcessOutput from './patch/processOutput';
import { AsyncLocalStorage } from 'node:async_hooks';
import patchPromise from './patch/promise';

export interface JestDoctor extends JestEnvironment {
  handleEvent?(
    event: Circus.AsyncEvent | Circus.SyncEvent,
    state: Circus.State,
  ): Promise<void>;
}

export interface JestDoctorConstructor<Environment = JestDoctor> {
  new (config: JestEnvironmentConfig, context: EnvironmentContext): Environment;
}

const createEnvMixin = <EnvironmentConstructor extends JestDoctorConstructor>(
  Environment: EnvironmentConstructor,
): JestDoctorConstructor<JestDoctorEnvironment> => {
  // @ts-expect-error strange ts rule where constructor arguments should be any[] where again TypeScript complains
  return class Base extends Environment implements JestDoctorEnvironment {
    public get currentTestName() {
      return this.asyncStorage.getStore() || MAIN_THREAD;
    }
    public readonly leakRecords = new Map<string, LeakRecord>();
    public readonly original = initOriginal();
    public readonly promiseOwner = new Map<Promise<void>, string>();
    public asyncHookDetector?: Function;
    public asyncHookCleaner?: Function;
    public readonly options: NormalizedOptions;
    public seenTearDown = false;
    public currentAfterEachCount = 0;
    public readonly reporterTmpDir: string;
    public readonly testPath: string;
    public readonly aggregatedReport;
    public tearDownError?: Error;
    public promiseToAsyncId = new Map<Promise<unknown>, number>();
    public asyncRoot = 0;
    public asyncIdToParentId = new Map<number, number>();
    public asyncIdToPromise = new Map<number, Promise<void>>();
    public asyncStorage = new AsyncLocalStorage<string>();
    public testTimeout: number;

    constructor(config: JestEnvironmentConfig, context: EnvironmentContext) {
      super(config, context);

      this.testTimeout =
        config.projectConfig.testTimeout ||
        config.globalConfig.testTimeout ||
        5_000;

      this.testPath = context.testPath.replace(/\W/g, '_');
      this.aggregatedReport = {
        testPath: context.testPath,
        promises: 0,
        timers: 0,
        fakeTimers: 0,
        console: 0,
        totalDelay: 0,
        processOutputs: 0,
        domListeners: 0,
      };

      const tmpDir = getReporterTmpDir(
        config.projectConfig.reporters || config.globalConfig.reporters,
      );

      const isWorker = typeof process.send === 'function';
      const seed = (isWorker ? process.ppid : process.pid).toString();

      this.reporterTmpDir = tmpDir
        ? path.join(tmpDir, seed, this.testPath + '.json')
        : '';

      this.options = normalizeOptions(
        config.projectConfig.testEnvironmentOptions,
      );

      initLeakRecord(this, MAIN_THREAD);
    }

    async setup() {
      await super.setup();

      const report = this.options.report;

      if (report.fakeTimers) {
        patchFakeTimers(this);
      }

      // always patch to be able to clean them
      patchTimers(this);

      if (report.console) {
        patchConsole(this, report.console);
      }
      if (report.processOutputs) {
        patchProcessOutput(this, report.processOutputs);
      }

      if (report.promises) {
        if (report.promises.mode === 'async_hooks') {
          patchPromiseConcurrency(this);
        } else {
          patchPromise(this);
        }
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
        this.asyncHookDetector?.();
        this.seenTearDown = true;
      } else if (circusEvent.name === 'setup') {
        const promiseOptions = this.options.report.promises;
        if (promiseOptions && promiseOptions.mode === 'async_hooks') {
          this.asyncHookCleaner = createAsyncHookCleaner(this);
          this.asyncHookDetector = createAsyncHookDetector(this);
        }

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
        // if it's a retry, rethrow
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

        process.stdout.write = this.original.process.stdout;
        process.stderr.write = this.original.process.stderr;

        this.asyncHookCleaner?.();
        // this is added here for safety reasons,
        // because jest could abort and don't hit teardown event
        this.asyncHookDetector?.();

        const hasLeak =
          this.aggregatedReport.promises +
          this.aggregatedReport.timers +
          this.aggregatedReport.fakeTimers +
          this.aggregatedReport.console +
          this.aggregatedReport.processOutputs +
          this.aggregatedReport.domListeners +
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
