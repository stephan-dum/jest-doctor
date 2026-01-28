export default {
  testMatch: [`${import.meta.dirname}/src/**/*.test.ts`],
  coverageReporters: ['text', ['json', { file: 'unit.json' }]],
  coverageDirectory: '.nyc_output',
  resetMocks: true,
  coverageProvider: 'v8',
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  preset: 'ts-jest',
};
