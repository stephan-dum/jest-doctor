export default {
  testEnvironment: process.env['TEST_ENVIRONMENT'],
  testEnvironmentOptions: JSON.parse(process.env['TEST_ENVIRONMENT_OPTIONS']),
  transform: {
    '^.+\\.(tsx?|m?js)$': 'ts-jest',
  },
  preset: 'ts-jest',
  maxWorkers: 1,
  maxConcurrency: 1,
  reporters: [],
};
