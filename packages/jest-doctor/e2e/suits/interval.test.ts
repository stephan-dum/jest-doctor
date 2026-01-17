import { runTest } from '../runJest';

it('detects interval leaks', async () => {
  const result = await runTest(`interval.fixture.ts`, {}, 'normal');
  expect(result.testResults[0].message).toContain('open timer');
});

it('detects fake interval leaks', async () => {
  const result = await runTest(`interval.fixture.ts`, {}, 'fake');
  expect(result.testResults[0].message).toContain('open fake timer');
});
