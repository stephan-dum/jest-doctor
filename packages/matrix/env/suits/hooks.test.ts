import runJest from '../runJest';

it('afterEach hooks are able to call jest.runAllTimers to resolve issues', async () => {
  const result = await runJest(`hooks.fixture.ts`);
  expect(result.success).toEqual(true);
});
