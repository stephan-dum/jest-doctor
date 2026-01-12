import runJest from '../runJest';

it('does not cascade leaks between tests', async () => {
  const result = await runJest(`isolation.fixture.ts`);

  expect(
    result.testResults[0].assertionResults.filter(
      (result) => result.status === 'failed',
    ),
  ).toHaveLength(1);
});
