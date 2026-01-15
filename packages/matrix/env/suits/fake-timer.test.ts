import runJest from '../runJest';

it('detects fake timer leaks', async () => {
  const result = await runJest(`fake-timer.fixture.ts`);
  expect(result.testResults[0].message).toContain('fake timer');
});
it('ignores fake timers when mock option is set to false', async () => {
  const result = await runJest(`fake-timer.fixture.ts`, {
    report: { fakeTimers: false },
  });
  expect(result.success).toEqual(true);
});
