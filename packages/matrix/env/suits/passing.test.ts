import runJest from '../runJest';

it('passes clean tests', async () => {
  const result = await runJest(`passing.fixture.ts`);
  expect(result.success).toBe(true);
});
