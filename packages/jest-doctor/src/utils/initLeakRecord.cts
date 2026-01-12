import { JestDoctorEnvironment } from '../types';

const initLeakRecord = (that: JestDoctorEnvironment, testName: string) => {
  const previousLeakRecord = that.leakRecords.get(testName);

  if (previousLeakRecord) {
    return previousLeakRecord;
  }

  const leakRecord = {
    promise: new Map(),
    interval: new Map(),
    timeout: new Map(),
    fakeTimeout: new Map(),
    fakeInterval: new Map(),
    console: [],
    totalDelay: 0,
  };

  that.leakRecords.set(testName, leakRecord);

  return leakRecord;
};

export default initLeakRecord;
