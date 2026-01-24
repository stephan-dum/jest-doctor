import { runTest } from '../../runJest';

it('detects fake timer leaks', async () => {
  const result = await runTest(`leaks/legacyFakeTimer.fixture.ts`);
  const assertions = result.testResults[0].assertionResults;

  expect(assertions[0].failureMessages[0]).toContain('2 open timer(s) found');
});
