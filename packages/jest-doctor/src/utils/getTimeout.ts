import type { JestDoctorEnvironment } from '../types';

const TIMEOUT_SYMBOL = Symbol.for('TEST_TIMEOUT_SYMBOL');

const getTimeout = (
  that: JestDoctorEnvironment,
  customTimeout: number | undefined,
) => {
  const runtimeTimeout = that.global[TIMEOUT_SYMBOL] as number | undefined;
  return customTimeout ?? runtimeTimeout ?? that.testTimeout;
};

export default getTimeout;
