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
