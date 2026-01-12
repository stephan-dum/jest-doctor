import { createRequire } from 'node:module';
const { resolve } = createRequire(import.meta.url);

export default {
  testEnvironment: resolve(process.env['TEST_ENVIRONMENT']),
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript', // or 'ecmascript' if not using TS
            tsx: true, // 👈 REQUIRED for JSX
            jsx: true, // (safe to keep true)
          },
          transform: {
            react: {
              runtime: 'automatic', // React 17+ JSX transform
            },
          },
        },
      },
    ],
  },
  reporters: [],
};
