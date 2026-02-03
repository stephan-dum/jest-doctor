import { runTest } from '../runJest';

it('should timeout the test', async () => {
  const result = await runTest(`testTimeout.fixture.ts`);
  expect(
    result.testResults[0].assertionResults[0].failureMessages[0],
  ).toContain('Exceeded timeout of');
  expect(result.success).toEqual(false);
});
