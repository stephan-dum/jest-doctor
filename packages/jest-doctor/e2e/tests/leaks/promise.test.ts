import { AssertionResults, runTest } from '../../runJest';

const expectPromise = (assertionResults: AssertionResults[]) => {
  const resolves = assertionResults[0];
  expect(resolves.status).toEqual('passed');

  const rejects = assertionResults[1];
  expect(rejects.failureMessages[0]).toContain('Promise rejected');

  const throws = assertionResults[2];
  expect(throws.failureMessages[0]).toContain('Error: Throws');

  const promiseRace = assertionResults[3];
  expect(promiseRace.status).toEqual('passed');

  const promiseAny = assertionResults[4];
  expect(promiseAny.status).toEqual('passed');

  const promiseAll = assertionResults[5];
  expect(promiseAll.status).toEqual('passed');

  const leaksResolved = assertionResults[6];
  expect(leaksResolved.failureMessages[0]).toContain('open promise');
};

it('detects unresolved promises by patch async_hooks', async () => {
  const result = await runTest(`leaks/promise.fixture.ts`, {
    report: { promises: { onError: 'throw', mode: 'async_hooks' } },
  });
  expectPromise(result.testResults[0].assertionResults);
});

it('detects unresolved promises by subclassing Promise', async () => {
  const result = await runTest(`leaks/promise.fixture.ts`, {
    report: { promises: { onError: 'throw', mode: 'subclass' } },
  });
  expectPromise(result.testResults[0].assertionResults);
});

it('ignores promise leaks if mock.promise is set to false', async () => {
  const result = await runTest(`leaks/promise.fixture.ts`, {}, 'leaks');

  expect(result.success).toBe(true);
});
