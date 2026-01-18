// this is used to avoid leak detection for the internal test
import { setTimeout } from 'node:timers';

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
});

describe('incorrect promise usage', () => {
  it('leaks a resolved promise', () => {
    void resolveFnToTest();
  });
  it('leaks a rejected promise', () => {
    void rejectFnToTest();
  });
});
