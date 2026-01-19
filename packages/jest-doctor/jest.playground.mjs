import { createRequire } from 'node:module';
import path from 'path';

const { resolve } = createRequire(import.meta.url);
export default {
  testEnvironment: resolve('./src/env/jsdom.ts'),
  testEnvironmentOptions: {
    verbose: true,
  },
  forceCoverageMatch: ['**/src/**/*'],
  testMatch: [`${path.dirname(import.meta.dirname)}/**/*.fixture.(ts|tsx)`],
  coverageReporters: ['text', ['json', { file: './.nyc_output/unit.json' }]],
  resetMocks: true,
  reporters: ['default', './dist/reporter.js'],
  coverageProvider: 'v8',
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  preset: 'ts-jest',
};
