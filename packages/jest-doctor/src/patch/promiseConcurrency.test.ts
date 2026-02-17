import patchPromiseConcurrency from './promiseConcurrency';
import { JestDoctorEnvironment } from '../types';

const promises = new Map();
const that = {
  global: {
    Promise: Promise,
  },
  currentTestName: 'test',
  promiseOwner: new Map(),
  leakRecords: new Map([
    [
      'test',
      {
        promises,
      },
    ],
  ]),
} as JestDoctorEnvironment;

patchPromiseConcurrency(that);
jest.useFakeTimers();

afterEach(() => {
  jest.clearAllTimers();
});

const setupPromises = (shouldResolve: boolean) => {
  const p1 = new Promise<void>((resolve, reject) => {
    setTimeout(shouldResolve ? resolve : reject, 10);
  });

  const p2 = new Promise<void>((resolve, reject) => {
    setTimeout(shouldResolve ? resolve : reject, 100);
  });

  that.promiseOwner.set(p1, 'test');
  that.promiseOwner.set(p2, 'test');

  promises.set(p1, {});
  promises.set(p2, {});

  return [p1, p2];
};

it('should remove all promises if any resolves', async () => {
  const promise = that.global.Promise.race(setupPromises(true));

  jest.advanceTimersToNextTimer();

  await promise;

  expect(promises.size).toBe(0);
  expect(that.promiseOwner.size).toBe(0);
});
it('should remove all promises if all reject', async () => {
  const promise = that.global.Promise.any(setupPromises(false));

  jest.runAllTimers();

  await expect(async () => await promise).rejects.toThrow(
    'All promises were rejected',
  );

  expect(promises.size).toBe(0);
  expect(that.promiseOwner.size).toBe(0);
});
