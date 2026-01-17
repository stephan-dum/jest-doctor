import { runTest } from '../runJest';

it('detects real timer leaks', async () => {
  const result = await runTest(`timeout.fixture.ts`);
  expect(result.testResults[0].message).toContain('open timer');
});
