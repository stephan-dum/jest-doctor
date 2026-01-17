import { runTest, TestResult } from '../runJest';

const checkPromise = (testResult: TestResult) => {
  const leaks = testResult.assertionResults[0];
  expect(leaks.failureMessages[0]).toContain('open promise');

  const resolves = testResult.assertionResults[1];
  expect(resolves.status).toEqual('passed');

  const rejects = testResult.assertionResults[2];
  expect(rejects.failureMessages[0]).toContain('Promise rejected');
};

it('detects unresolved promises by patch async_hooks', async () => {
  const result = await runTest(`promise.fixture.ts`);

  checkPromise(result.testResults[0]);
});

it('detects unresolved promises by patch promise', async () => {
  const result = await runTest(`promise.fixture.ts`, {
    report: { promises: { patch: 'promise' } },
  });

  checkPromise(result.testResults[0]);
});

it('ignores promise leaks if mock.promise is set to false', async () => {
  const result = await runTest(
    `promise.fixture.ts`,
    {
      report: { promises: false },
    },
    'leaks',
  );

  expect(result.success).toBe(true);
});
