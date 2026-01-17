import { setTimeout } from 'node:timers';

it('leaks a promise', () => {
  void new Promise<void>((resolve) => {
    setTimeout(resolve, 10);
  });
});

it('resolves a promise', () => {
  return new Promise<void>((resolve) => {
    resolve();
  });
});

it('rejects a promise', () => {
  return new Promise<void>((_, reject) => {
    reject(new Error(`Promise rejected`));
  });
});
