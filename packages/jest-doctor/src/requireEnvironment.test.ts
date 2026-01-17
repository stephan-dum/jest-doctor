import requireEnvironment from './requireEnvironment';
import createEnvMixin from './createEnvMixin';

jest.mock('./createEnvMixin', () => jest.fn());
it('loads an environment', () => {
  requireEnvironment('jest-environment-node');
  expect(createEnvMixin).toHaveBeenCalledTimes(1);
});

it('throws if environment is missing', () => {
  expect(() => requireEnvironment('unknown-environment')).toThrow(
    'unknown-environment needs to be installed as a peer dependency',
  );
});
