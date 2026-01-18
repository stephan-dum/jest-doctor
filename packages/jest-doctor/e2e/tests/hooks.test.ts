import { runTest } from '../runJest';

it('afterEach hooks are able to call jest.runAllTimers to resolve issues', async () => {
  const result = await runTest(`hooks.fixture.ts`);
  expect(result.success).toEqual(true);
});
