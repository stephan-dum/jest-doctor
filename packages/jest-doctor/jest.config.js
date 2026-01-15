import { createRequire } from 'node:module';

const { resolve } = createRequire(import.meta.url);
import remapper from './coverageRemapper.cjs';

export default {
  testMatch: [`${import.meta.dirname}/**/*.test.ts`],
  moduleNameMapper: {
    '^(.*)\\.cjs$': '$1.cts',
  },
  coverageReporters: [
    'text',
    'html',
    [
      resolve('./rawNycReporter.cjs'),
      {
        outputDir: '../matrix/env/.nyc_output/jest',
        remapper: remapper,
      },
    ],
  ],
  resetMocks: true,
  /*transform: {
    '^.+\\.cts$': 'ts-jest',
    '^.+\\.ts$': 'ts-jest',
  },
  preset: 'ts-jest',*/
  transform: {
    '^.+\\.(ts|cts|cjs)$': [
      resolve('@swc/jest'),
      {
        sourceMaps: 'inline',
        jsc: {
          parser: { syntax: 'typescript' },
          target: 'es2022',
        },
        module: { type: 'commonjs' },
      },
    ],
  },
};
