import type { Circus } from '@jest/types';

const getAllAfterEach = (node?: Circus.DescribeBlock): number => {
  if (!node) {
    return 0;
  }

  return node.hooks.reduce((currentCount, hook) => {
    if (hook.type === 'afterEach') {
      return currentCount + 1;
    }
    return currentCount;
  }, getAllAfterEach(node.parent));
};

export default getAllAfterEach;
