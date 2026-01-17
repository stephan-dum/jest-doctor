import { runTest } from '../runJest';

it('timerIsolation option works for react timer leaks afterEach hook', async () => {
  const result = await runTest(`react.fixture.tsx`, {}, 'unmounts', 'jsdom');

  expect(result.success).toEqual(true);
});

it('catches react internal errors', async () => {
  const result = await runTest(`react.fixture.tsx`, {}, 'leaks', 'jsdom');

  expect(result.testResults[0].message).toContain('console output');
});
