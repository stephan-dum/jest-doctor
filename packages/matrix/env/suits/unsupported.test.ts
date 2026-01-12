import runJest from '../runJest';

it('does warn if modern fake timers can not be patched any more', async () => {
  const result = await runJest(
    `unsupported.fixture.ts`,
    {},
    '.*',
    './FakeEnvironment.js',
  );
  expect(result.success).toEqual(true);
});
