// this is used to avoid leak detection for the internal test
import { setTimeout } from 'node:timers';
import { it } from '@jest/globals';

const resolveFnToTest = () => {
  return new Promise<void>((resolve) => {
    setTimeout(resolve);
  });
};

const rejectFnToTest = () => {
  return new Promise<void>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Promise rejected`));
    });
  });
};

// the order matters because we are leaking a promise which would interfere with other tests
describe('correct promise usage', () => {
  it('resolves a promise', async () => {
    await resolveFnToTest();
  });

  it('rejects a promise', () => {
    return rejectFnToTest();
  });

  it('Promise.race', async () => {
    jest.useFakeTimers();
    const p1 = new Promise((resolve) => setTimeout(resolve, 1000));
    const p2 = new Promise((resolve) => setTimeout(resolve, 100));
    const p3 = Promise.race([p1, p2]);

    jest.advanceTimersToNextTimer();

    await p3;

    jest.clearAllTimers();
  });

  it('Promise.all', async () => {
    jest.useFakeTimers();
    const p1 = new Promise((resolve) => setTimeout(resolve, 1000));
    const p2 = new Promise((_, reject) => setTimeout(reject, 100));
    const p3 = Promise.all([p1, p2]);

    jest.advanceTimersToNextTimer();

    try {
      await p3;
    } catch {
      /* ignored */
    }

    jest.clearAllTimers();
  });
});

describe('incorrect promise usage', () => {
  it('leaks a resolved promise', () => {
    void resolveFnToTest();
  });
});
