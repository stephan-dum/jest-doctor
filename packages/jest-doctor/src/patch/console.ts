import { format } from 'node:util';
import type { JestDoctorEnvironment, ConsoleOptions } from '../types';
import getStack from '../utils/getStack';

export const isIgnored = (
  message: string,
  ignorePatterns: ConsoleOptions['ignore'],
): boolean => {
  return ignorePatterns.some((pattern) => {
    if (typeof pattern === 'string') {
      return message.includes(pattern);
    }
    return pattern.test(message);
  });
};
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

      if (!isIgnored(message, consoleOptions.ignore)) {
        that.leakRecords.get(that.currentTestName)?.console.push({
          method: consoleMethod,
          stack: getStack(
            env.console[consoleMethod],
            'Console.' + consoleMethod,
          ),
          testName: that.currentTestName,
          message,
        });
      }

      return originalMethod(...args);
    };
  }
};

export default patchConsole;
