import { it } from '@jest/globals';

it('is passes', async () => {
  jest.useFakeTimers();
  const resolvedPromise = new Promise<void>((resolve) => {
    setTimeout(resolve, 100);
  });

  setImmediate(() => {});

  jest.runAllTimers();
  await resolvedPromise;

  const rejectedPromise = new Promise<void>((_, reject) => {
    setTimeout(reject, 10);
  });
  jest.runAllTimers();
  try {
    await rejectedPromise;
  } catch {
    // empty
  }

  clearTimeout(setTimeout(() => {}, 10));
  clearInterval(setInterval(() => {}, 10));
  clearImmediate(setImmediate(() => {}));

  jest.useRealTimers();

  clearTimeout(setTimeout(() => {}, 10));
  clearImmediate(setImmediate(() => {}));

  await new Promise((resolve) => {
    setImmediate(resolve);
  });

  await new Promise<void>((resolve) => {
    setTimeout(resolve, 10);
  });
  await new Promise<void>((_, reject) => {
    const intervalId = setInterval(() => {
      clearInterval(intervalId);
      reject(new Error('Something happened'));
    }, 10);
  }).catch(() => {
    /* all good */
  });
  await new Promise<void>((resolve) => {
    setTimeout(resolve);
  });
  await new Promise<void>((_, reject) => {
    const intervalId = setInterval(() => {
      clearInterval(intervalId);
      reject(new Error('Something happened'));
    });
  }).catch(() => {
    /* all good */
  });
});

it('passes Promise.race', async () => {
  jest.useFakeTimers();
  const p1 = new Promise((resolve) => setTimeout(resolve, 1000));
  const p2 = new Promise((resolve) => setTimeout(resolve, 100));
  const p3 = Promise.race([p1, p2]);

  jest.advanceTimersToNextTimer();

  await p3;

  jest.clearAllTimers();
});

it('passes Promise.all', async () => {
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
