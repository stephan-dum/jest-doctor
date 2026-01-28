import { setTimeout } from 'node:timers';

void new Promise((resolve) => {
  setTimeout(resolve, 100);
});

it('does nothing', () => {});
