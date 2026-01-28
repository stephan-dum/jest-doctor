import { runTest } from '../runJest';

it('timerIsolation option works for react timer leaks afterEach hook', async () => {
  const result = await runTest(`react.fixture.tsx`, {}, 'unmounts', 'jsdom');

  expect(result.success).toEqual(true);
});

it('catches react internal errors', async () => {
  const result = await runTest(`react.fixture.tsx`, {}, 'leaks', 'jsdom');

  expect(
    result.testResults[0].assertionResults[1].failureMessages[0],
  ).toContain('console output');

  expect(
    result.testResults[0].assertionResults[2].failureMessages[0],
  ).toContain('DOM listener');
});
