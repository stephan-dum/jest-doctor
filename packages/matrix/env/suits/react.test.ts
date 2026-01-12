import runJest from '../runJest';

it('detects real timer leaks', async () => {
  const result = await runJest(
    `react.fixture.tsx`,
    {},
    'unmounts',
    'jest-doctor/env/jsdom',
  );

  expect(result.success).toEqual(true);
});

it('catches react internal errors', async () => {
  const result = await runJest(
    `react.fixture.tsx`,
    {},
    'leaks',
    'jest-doctor/env/jsdom',
  );

  expect(result.testResults[0].message).toContain('console output');
});
