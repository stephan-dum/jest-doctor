export default {
  testMatch: [`${import.meta.dirname}/src/**/*.test.ts`],
  coverageReporters: ['text', ['json', { file: 'unit.json' }]],
  coverageDirectory: '.nyc_output',
  resetMocks: true,
  coverageProvider: 'v8',
  preset: 'ts-jest',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
};
