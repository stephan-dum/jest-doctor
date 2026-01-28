import { format } from 'node:util';
import type { JestDoctorEnvironment, ConsoleOptions } from '../types';
import getStack from '../utils/getStack';
import isIgnored from '../utils/isIgnored';

const patchConsole = (
  that: JestDoctorEnvironment,
  consoleOptions: ConsoleOptions,
) => {
  const env = that.global;

  for (const consoleMethod of consoleOptions.methods) {
    const originalMethod = (
      env.console[consoleMethod] as (...args: unknown[]) => unknown
    ).bind(env.console);

    (env.console as unknown as Record<string, (...args: unknown[]) => void>)[
      consoleMethod
    ] = (...args: unknown[]) => {
      const message = format(...args);
      const stack = getStack(env.console[consoleMethod]);

      if (
        !isIgnored(message, consoleOptions.ignoreMessage) &&
        !isIgnored(stack, consoleOptions.ignoreStack)
      ) {
        that.leakRecords.get(that.currentTestName)?.console.push({
          method: consoleMethod,
          stack,
        });
      }

      return originalMethod(...args);
    };
  }
};

export default patchConsole;
