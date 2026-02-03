import { setTimeout } from 'node:timers';

it('should timeout', async () => {
  await new Promise((resolve) => setTimeout(resolve, 100));
}, 10);
