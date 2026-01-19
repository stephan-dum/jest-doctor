import {
  NormalizedOptions,
  OnError,
  RawOptions,
  ThrowOrWarn,
  TimerIsolation,
} from '../types';

import * as zod from 'zod';

const DEFAULTS = {
  report: {
    console: {
      onError: 'throw' as ThrowOrWarn,
      methods: ['log', 'warn', 'error', 'info', 'debug'] as (
        | 'warn'
        | 'log'
        | 'error'
        | 'info'
        | 'debug'
      )[],
      ignore: [] as Array<string | RegExp>,
    },
    timers: 'throw' as OnError,
    fakeTimers: 'throw' as OnError,
    promises: 'throw' as OnError,
  },
  verbose: false,
  delayThreshold: 0,
  timerIsolation: 'afterEach' as TimerIsolation,
  clearTimers: true,
};

const onError = zod
  .union([zod.literal(false), zod.enum(['throw', 'warn'])])
  .default('throw');

const schema = zod
  .object({
    report: zod
      .object({
        console: zod
          .union([
            zod.literal(false),
            zod.object({
              onError: zod.enum(['throw', 'warn']).default('throw'),
              methods: zod
                .array(zod.enum(['log', 'warn', 'error', 'info', 'debug']))
                .default(DEFAULTS.report.console.methods),
              ignore: zod
                .union([
                  zod.string(),
                  zod.instanceof(RegExp),
                  zod.array(zod.union([zod.string(), zod.instanceof(RegExp)])),
                ])
                .transform((value) => (Array.isArray(value) ? value : [value]))
                .default([]),
            }),
          ])
          .default(DEFAULTS.report.console),
        timers: onError,
        fakeTimers: onError,
        promises: onError,
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
