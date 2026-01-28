import saveRequire from './saveRequire';

it('loads an environment', () => {
  expect(() => saveRequire('jest-environment-node')).not.toThrow();
});

it('throws if environment is missing', () => {
  expect(() => saveRequire('unknown-environment')).toThrow(
    'unknown-environment needs to be installed as a peer dependency',
  );
});
