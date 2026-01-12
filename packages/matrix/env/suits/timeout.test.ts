import runJest from '../runJest';

it('detects real timer leaks', async () => {
  const result = await runJest(`timeout.fixture.ts`);
  expect(result.testResults[0].message).toContain('open timeout');
});
