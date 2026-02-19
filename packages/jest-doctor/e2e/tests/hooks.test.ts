import { runTest } from '../runJest';

it('afterEach hooks are able to call jest.runAllTimers to resolve issues', async () => {
  const result = await runTest(`hooks.fixture.ts`);
  expect(result.success).toEqual(true);
});

it('timeouts in beforeEach hooks are caught as issue with beforeEach strategy', async () => {
  const result = await runTest(`hooks.fixture.ts`, {
    timerIsolation: 'beforeEach',
  });
  expect(result.success).toEqual(false);
});
