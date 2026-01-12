import { JestDoctorEnvironment } from '../types';
import getStack from './getStack.cjs';

const consoleMethods: Array<keyof Console> = [
  'log',
  'info',
  'warn',
  'error',
  'debug',
  'trace',
];

const patchConsole = (that: JestDoctorEnvironment) => {
  const env = that.global;

  for (const consoleMethod of consoleMethods) {
    const originalMethod = (
      env.console[consoleMethod] as (...args: unknown[]) => unknown
    ).bind(env.console);

    (env.console as unknown as Record<string, (...args: unknown[]) => void>)[
      consoleMethod
    ] = (...args: unknown[]) => {
      that.leakRecords.get(that.currentTestName)?.console.push({
        method: consoleMethod,
        stack: getStack(env.console[consoleMethod]),
        testName: that.currentTestName,
        message: args,
      });

      return originalMethod(...args);
    };
  }
};

export default patchConsole;
