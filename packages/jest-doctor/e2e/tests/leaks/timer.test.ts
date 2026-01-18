import { runTest } from '../../runJest';

it('detects real timer leaks', async () => {
  const result = await runTest(`leaks/timer.fixture.ts`);
  const assertions = result.testResults[0].assertionResults;

  expect(assertions[0].failureMessages[0]).toContain('2 open timer');
  expect(assertions[1].status).toEqual('passed');
});

it('ignore real timer leaks when patch options is set to false', async () => {
  const result = await runTest(`leaks/timer.fixture.ts`, {
    report: {
      timers: false,
    },
  });
  expect(result.success).toEqual(true);
});
