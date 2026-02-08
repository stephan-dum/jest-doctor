import { runReporter } from '../runJest';

it('shows reporter output', async () => {
  const result = await runReporter(`reporter.fixture.ts`, {
    report: { promises: { onError: 'throw' } },
  });
  expect(result).toContain('Total open promises: 1');
  expect(result).toContain('Total open timers: 1');
  expect(result).toContain('Total open fake timers: 1');
  expect(result).toContain('Total console outputs: 1');
  expect(result).toContain('Total process outputs: 1');
  expect(result).toContain('Total delay: 100');
});
