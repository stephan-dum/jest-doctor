export default {
  testEnvironment: process.env['TEST_ENVIRONMENT'],
  transform: {
    '^.+\\.(tsx?|m?js)$': 'ts-jest',
  },
  fakeTimers: {
    enableGlobally: true,
  },
  preset: 'ts-jest',
  maxWorkers: 1,
  maxConcurrency: 1,
  reporters: [],
};
