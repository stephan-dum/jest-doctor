import { runTest, TestResult } from '../../runJest';

const checkPromise = (testResult: TestResult) => {
  const resolves = testResult.assertionResults[0];
  expect(resolves.status).toEqual('passed');

  const rejects = testResult.assertionResults[1];
  expect(rejects.failureMessages[0]).toContain('Promise rejected');

  const leaksResolved = testResult.assertionResults[2];
  expect(leaksResolved.failureMessages[0]).toContain('open promise');
};

it('detects unresolved promises by patch async_hooks', async () => {
  const result = await runTest(`leaks/promise.fixture.ts`);
  console.log(result);
  expect(false).toEqual(true);
  checkPromise(result.testResults[0]);
});

it('ignores promise leaks if mock.promise is set to false', async () => {
  const result = await runTest(
    `leaks/promise.fixture.ts`,
    {
      report: { promises: false },
    },
    'leaks',
  );

  expect(result.success).toBe(true);
});
