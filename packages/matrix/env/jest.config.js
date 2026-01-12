import { createRequire } from 'node:module';

const { resolve } = createRequire(import.meta.url);

export default {
  testMatch: [`${import.meta.dirname}/suits/**/*.test.ts`],
  transform: {
    '^.+\\.ts$': resolve('@swc/jest'),
  },
  testTimeout: 15_000,
};
