import { createRequire } from 'node:module';

const { resolve } = createRequire(import.meta.url);

export default {
  testMatch: [`${import.meta.dirname}/e2e/tests/**/*.test.ts`],
  transform: {
    '^.+\\.(ts|m?js)$': resolve('@swc/jest'),
  },
  moduleFileExtensions: ['mjs', 'js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  testTimeout: 15_000,
};
