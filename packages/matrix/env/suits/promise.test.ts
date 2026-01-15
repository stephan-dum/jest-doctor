import runJest from '../runJest';

it('detects unresolved promises', async () => {
  const result = await runJest(`promise.fixture.ts`);
  expect(result.success).toBe(false);
  expect(result.testResults[0].message).toContain('open promise');
});

it('ignores promise leaks if mock.promise is set to false', async () => {
  const result = await runJest(`promise.fixture.ts`, {
    report: { promises: false },
  });
  expect(result.success).toBe(true);
});
