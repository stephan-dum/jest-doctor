export default {
  testMatch: [`${import.meta.dirname}/src/**/*.test.ts`],
  coverageReporters: ['text', ['json', { file: '../.nyc_output/unit.json' }]],
  resetMocks: true,
  coverageProvider: 'v8',
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  preset: 'ts-jest',
};
