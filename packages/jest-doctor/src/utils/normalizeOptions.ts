import * as zod from 'zod';

import {
  NormalizedOptions,
  RawOptions,
  ThrowOrWarn,
  TimerIsolation,
} from '../types';

const ignore = [] as Array<string | RegExp>;
const onError = 'throw' as ThrowOrWarn;
const reportHandler = {
  ignoreStack: ignore,
  onError,
};

const DEFAULTS = {
  report: {
    console: {
      ...reportHandler,
      ignoreMessage: ignore,
      methods: ['log', 'warn', 'error', 'info', 'debug'] as (
        | 'warn'
        | 'log'
        | 'error'
        | 'info'
        | 'debug'
      )[],
    },
    processOutputs: {
      ...reportHandler,
      ignoreMessage: ignore,
      methods: ['stdout', 'stderr'] as Array<'stdout' | 'stderr'>,
    },
    timers: reportHandler,
    fakeTimers: reportHandler,
    promises: false as const,
    domListeners: reportHandler,
  },
  verbose: false,
  delayThreshold: 0,
  timerIsolation: 'afterEach' as TimerIsolation,
  clearTimers: true,
};

const schemaIgnore = zod
  .union([
    zod.string(),
    zod.instanceof(RegExp),
    zod.array(zod.union([zod.string(), zod.instanceof(RegExp)])),
  ])
  .transform((value) => (Array.isArray(value) ? value : [value]))
  .default([]);

const createReportHandler = (addition: Record<string, unknown> = {}) =>
  zod.union([
    zod.literal(false),
    zod.object({
      onError: zod.enum(['throw', 'warn']).default('throw'),
      ignoreStack: schemaIgnore,
      ...addition,
    }),
  ]);
const schema = zod
  .object({
    report: zod
      .object({
        console: createReportHandler({
          methods: zod
            .array(zod.enum(['log', 'warn', 'error', 'info', 'debug']))
            .default(DEFAULTS.report.console.methods),
          ignoreMessage: schemaIgnore,
        }).default(DEFAULTS.report.console),
        timers: createReportHandler().default(DEFAULTS.report.timers),
        fakeTimers: createReportHandler().default(DEFAULTS.report.fakeTimers),
        promises: createReportHandler({
          mode: zod.enum(['async_hooks', 'subclass']).default('async_hooks'),
        }).default(DEFAULTS.report.promises),
        domListeners: createReportHandler().default(
          DEFAULTS.report.domListeners,
        ),
        processOutputs: createReportHandler({
          methods: zod
            .array(zod.enum(['stdout', 'stderr']))
            .default(DEFAULTS.report.processOutputs.methods),
          ignoreMessage: schemaIgnore,
        }).default(DEFAULTS.report.processOutputs),
      })
      .default(DEFAULTS.report),
    verbose: zod.boolean().default(false),
    delayThreshold: zod.int().gte(0).default(0),
    timerIsolation: zod.enum(['afterEach', 'immediate']).default('afterEach'),
    clearTimers: zod.boolean().default(true),
  })
  .default(DEFAULTS);

export function normalizeOptions(raw?: RawOptions) {
  try {
    return schema.parse(raw || {}) as NormalizedOptions;
  } catch (error) {
    throw zod.prettifyError(error as zod.ZodError);
  }
}

export default normalizeOptions;
