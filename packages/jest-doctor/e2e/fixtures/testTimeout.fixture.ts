import { setTimeout } from 'node:timers';

afterEach(async () => {
  await new Promise((resolve) => setTimeout(resolve, 100));
}, 10);
it('should timeout', async () => {
  await new Promise((resolve) => setTimeout(resolve, 100));
}, 10);
