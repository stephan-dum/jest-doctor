import { runTest } from '../../runJest';

it('detects fake timer leaks', async () => {
  const result = await runTest(`leaks/fake-timer.fixture.ts`);
  const assertions = result.testResults[0].assertionResults;

  expect(assertions[0].failureMessages[0]).toContain('2 open fake timer');
  expect(assertions[1].status).toEqual('passed');
  expect(assertions[2].status).toEqual('passed');
});
it('ignores fake timers when patch option is set to false', async () => {
  const result = await runTest(`leaks/fake-timer.fixture.ts`, {
    report: { fakeTimers: false },
  });
  expect(result.success).toEqual(true);
});
