import { it } from '@jest/globals';

it('tests', async () => {
  jest.useFakeTimers();
  const p1 = new Promise((resolve) => setTimeout(resolve, 1000));
  const p2 = new Promise((resolve) => setTimeout(resolve, 100));
  const p3 = Promise.race([p1, p2]);

  jest.advanceTimersToNextTimer();

  await p3;

  jest.clearAllTimers();
});
