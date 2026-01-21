import createEnvMixin from './createEnvMixin';
import NodeEnvironment from 'jest-environment-node';
import type {
  EnvironmentContext,
  JestEnvironmentConfig,
} from '@jest/environment';
import { Circus } from '@jest/types';

const handleEvent = jest.fn();
class FakeEnvironment extends NodeEnvironment {
  handleEvent() {
    handleEvent();
    return Promise.resolve();
  }
}

const Env = createEnvMixin(FakeEnvironment);

it('tests edge cases', async () => {
  const env = new Env(
    {
      globalConfig: {
        reporters: [],
        seed: 0,
      },
      projectConfig: {
        testEnvironmentOptions: {},
      },
    } as unknown as JestEnvironmentConfig,
    { testPath: '' } as unknown as EnvironmentContext,
  );

  await env.setup();

  await env.handleTestEvent?.(
    { name: 'teardown' },
    {} as unknown as Circus.State,
  );

  expect(handleEvent).toHaveBeenCalledTimes(1);

  env.global.setTimeout(() => {}, 100);

  try {
    await env.teardown();
  } catch (error) {
    expect((error as Error).stack).toContain('open timer');
  }

  // rethrow
  try {
    await env.teardown();
  } catch (error) {
    expect((error as Error).stack).toContain('open timer');
  }
});
