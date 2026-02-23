import { runTest } from '../../runJest';

it('should unregister with abort controller', async () => {
  const result = await runTest('leaks/listener.fixture.ts', {}, '.*', 'jsdom');
  expect(result.testResults[0].assertionResults[0].status).toEqual('passed');
});
