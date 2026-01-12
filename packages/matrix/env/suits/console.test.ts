import runJest from '../runJest';

it('detects console output', async () => {
  const result = await runJest(`console.fixture.ts`);
  expect(result.testResults[0].message).toContain('console output');
});

it('ignores console output if mock.console is set to false', async () => {
  const result = await runJest(`console.fixture.ts`, {
    mock: { console: false },
  });
  expect(result.success).toEqual(true);
});
