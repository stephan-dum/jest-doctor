import { runTest } from '../../runJest';

it('detects console output', async () => {
  const result = await runTest(`leaks/console.fixture.ts`);

  const testResult = result.testResults[0].assertionResults;

  expect(testResult[0].failureMessages[0]).toContain('console output');

  expect(testResult[1].status).toEqual('passed');
});

it('ignores console output if report.console is set to false', async () => {
  const result = await runTest(`leaks/console.fixture.ts`, {
    report: { console: false },
  });
  expect(result.success).toEqual(true);
});

it('ignores console output if report.console.ignore is set with a string', async () => {
  const result = await runTest(`leaks/console.fixture.ts`, {
    report: {
      console: {
        ignore: 'ops',
      },
    },
  });

  expect(result.success).toEqual(true);
});
