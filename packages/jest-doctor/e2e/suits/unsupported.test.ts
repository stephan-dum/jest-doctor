import { runTest } from '../runJest';

it('does warn if modern fake timers can not be patched any more', async () => {
  const result = await runTest(`unsupported.fixture.ts`);
  expect(result.success).toEqual(true);
});
