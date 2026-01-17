import { runTest } from '../runJest';

it('passes clean tests', async () => {
  const result = await runTest(`passing.fixture.ts`, {
    delayThreshold: 100,
  });
  expect(result.success).toBe(true);
});
