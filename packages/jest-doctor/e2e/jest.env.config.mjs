import path from 'path';
import { createRequire } from 'node:module';
const { resolve } = createRequire(import.meta.url);

const jestDoctorBase = path.dirname(resolve('jest-doctor/package.json'));
export default {
  testEnvironment: resolve(
    path.join(
      jestDoctorBase,
      'src/env',
      process.env['TEST_ENVIRONMENT'] + '.ts',
    ),
  ),
  //collectCoverageFrom: ['**/*'],
  //coverageReporters: ['text'],
  //collectCoverage: true,
  transform: {
    '^.+\\.(tsx?|m?js)$': 'ts-jest',
  },
  preset: 'ts-jest',
  /*transform: {
    '^.+\\.(js|jsx|ts|tsx)$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: true,
          },
          transform: {
            react: {
              runtime: 'automatic', // React 17+ JSX transform
            },
          },
        },
      },
    ],
  },*/
  reporters: [],
};
