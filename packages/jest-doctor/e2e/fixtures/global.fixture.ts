import { setTimeout } from 'node:timers';

void new Promise((resolve) => {
  setTimeout(resolve, 10_000);
});

it('does nothing', () => {});
