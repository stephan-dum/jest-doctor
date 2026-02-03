import { runTest } from '../runJest';

it('should timeout the test', async () => {
  const result = await runTest(`testTimeout.fixture.ts`);
  const failureMessages =
    result.testResults[0].assertionResults[0].failureMessages;
  expect(failureMessages[0]).toContain('Exceeded timeout of 10ms for a test');
  expect(failureMessages[1]).toContain('Exceeded timeout of 10ms for a hook');
  expect(result.success).toEqual(false);
});
