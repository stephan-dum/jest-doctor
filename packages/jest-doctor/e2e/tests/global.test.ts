import { runTest } from '../runJest';

it('throw an global error', async () => {
  const result = await runTest(`global.fixture.ts`, {
    report: { promises: { onError: 'throw' } },
  });
  expect(result.testResults[0].message).toContain('open promise');
});
