import type {
  EnvironmentContext,
  JestEnvironment,
  JestEnvironmentConfig,
} from '@jest/environment';
import type { Circus } from '@jest/types';
import type { LegacyFakeTimers, ModernFakeTimers } from '@jest/fake-timers';
import type { ModuleMocker } from 'jest-mock';
import type { Context } from 'node:vm';
import { JestDoctorEnvironment, LeakRecord, NormalizedOptions } from './types';

import patchConsole from './patch/console.cjs';
import initOriginal from './utils/initOriginal.cjs';
import patchFakeTimers from './patch/fakeTimers.cjs';
import { MAIN_THREAD } from './consts.cjs';
import timers from './patch/timers.cjs';
import patchIt from './patch/it.cjs';
import createAsyncHookDetector from './utils/createAsyncHookDetector.cjs';
import createAsyncHookCleaner from './utils/createAsyncHookCleaner.cjs';
import reportLeaks from './utils/reportLeaks.cjs';
import cleanupAfterTest from './utils/cleanupAfterTest.cjs';
import initLeakRecord from './utils/initLeakRecord.cjs';
import { AsyncHook } from 'node:async_hooks';
import patchHook from './patch/hook.cjs';
import getAllAfterEach from './utils/getAllAfterEach.cjs';
import normalizeOptions from './utils/normalizeOptions.cjs';
import getReporterTmpDir from './utils/getReporterTmpDir.cjs';

const createEnvMixin = <
  EnvironmentConstructor extends new (
    config: JestEnvironmentConfig,
    context: EnvironmentContext,
  ) => JestEnvironment,
>(
  Environment: EnvironmentConstructor,
) => {
  return class Base implements JestEnvironment, JestDoctorEnvironment {
    public currentTestName: string = MAIN_THREAD;
    public leakRecords = new Map<string, LeakRecord>();
    public original = initOriginal();
    public env: JestEnvironment;

    public global: JestEnvironment['global'];
    public fakeTimers: LegacyFakeTimers<unknown> | null;
    public fakeTimersModern: ModernFakeTimers | null;
    public moduleMocker: ModuleMocker | null;
    public getVmContext: () => Context | null;
    public exportConditions: (() => Array<string>) | undefined;
    public promiseOwner = new Map<number, string>();
    public asyncHookDetector?: AsyncHook;
    public asyncHookCleaner?: AsyncHook;
    public options: NormalizedOptions;
    public seenTearDown = false;
    public currentAfterEachCount = 0;
    public reporterTmpDir = '';

    constructor(config: JestEnvironmentConfig, context: EnvironmentContext) {
      this.env = new Environment(config, context);

      this.reporterTmpDir = getReporterTmpDir(config.projectConfig.reporters);
      this.options = normalizeOptions(
        config.projectConfig.testEnvironmentOptions,
      );
      this.global = this.env.global;
      this.fakeTimers = this.env.fakeTimers;
      this.fakeTimersModern = this.env.fakeTimersModern;
      this.moduleMocker = this.env.moduleMocker;
      this.getVmContext = this.env.getVmContext.bind(this.env);
      this.exportConditions = this.env.exportConditions;

      initLeakRecord(this, MAIN_THREAD);

      if (this.options.report.promises) {
        this.asyncHookCleaner = createAsyncHookCleaner(this);
        this.asyncHookDetector = createAsyncHookDetector(this);
      }
    }

    async setup() {
      await this.env.setup();

      if (this.options.report.fakeTimers) {
        patchFakeTimers(this);
      }
      if (this.options.report.timers) {
        timers(this);
      }
      if (this.options.report.console) {
        patchConsole(this, this.options.report.console);
      }
    }

    handleTestEvent: JestEnvironment['handleTestEvent'] = async (
      event,
      state,
    ) => {
      if (event.name === 'test_start') {
        if (this.options.timerIsolation === 'afterEach') {
          this.currentAfterEachCount = getAllAfterEach(event.test.parent);
        }
      } else if (event.name === 'teardown') {
        // the detector needs to be disabled here to avoid the teardown promise polluting the report
        this.asyncHookDetector?.disable();
        this.seenTearDown = true;
      } else if (event.name === 'setup') {
        this.asyncHookCleaner?.enable();
        this.asyncHookDetector?.enable();

        patchIt(this);
        patchHook(this, 'beforeEach');
        patchHook(this, 'beforeAll');
        patchHook(this, 'afterEach');
        patchHook(this, 'afterAll');
      }

      await this.env.handleTestEvent?.(event as Circus.AsyncEvent, state);
    };

    async teardown() {
      await this.env.teardown();
      const leakRecord = this.leakRecords.get(MAIN_THREAD) as LeakRecord;

      try {
        // in case jest discovers an error all following events will be skipped
        // and teardown is executed immediately
        if (this.seenTearDown) {
          reportLeaks(this, leakRecord);
        }
      } finally {
        cleanupAfterTest(this, leakRecord, MAIN_THREAD);
        this.asyncHookCleaner?.disable();
        // this is added here for safety reasons,
        // because jest could abort and dont hit teardown event
        this.asyncHookDetector?.disable();
      }
    }
  };
};

export default createEnvMixin;
