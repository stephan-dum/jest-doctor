import { runTest } from '../runJest';

it('detects console output', async () => {
  const result = await runTest(`console.fixture.ts`);
  expect(result.testResults[0].message).toContain('console output');
});

it('ignores console output if report.console is set to false', async () => {
  const result = await runTest(`console.fixture.ts`, {
    report: { console: false },
  });
  expect(result.success).toEqual(true);
});
it('ignores console output if report.console.ignore is set with a string', async () => {
  const result = await runTest(`console.fixture.ts`, {
    report: {
      console: {
        ignore: 'ops',
      },
    },
  });

  expect(result.success).toEqual(true);
});
