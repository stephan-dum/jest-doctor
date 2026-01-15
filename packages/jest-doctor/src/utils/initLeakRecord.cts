import { JestDoctorEnvironment } from '../types';

const initLeakRecord = (that: JestDoctorEnvironment, testName: string) => {
  const previousLeakRecord = that.leakRecords.get(testName);

  if (previousLeakRecord) {
    return previousLeakRecord;
  }

  const leakRecord = {
    promises: new Map(),
    timers: new Map(),
    fakeTimers: new Map(),
    console: [],
    totalDelay: 0,
  };

  that.leakRecords.set(testName, leakRecord);

  return leakRecord;
};

export default initLeakRecord;
