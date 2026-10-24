import { runTest } from '../runJest';

it('detects console output', async () => {
  const result = await runTest(`each.fixture.ts`);

  const testResult = result.testResults[0].assertionResults;

  expect(testResult[0].failureMessages[0]).toContain('console output');
  expect(testResult[1].failureMessages[0]).toContain('console output');

  expect(testResult[2].status).toEqual('passed');
  expect(testResult[3].status).toEqual('passed');
});
