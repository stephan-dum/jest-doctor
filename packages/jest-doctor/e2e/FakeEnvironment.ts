import createEnvMixin from '../src/createEnvMixin';
import NodeEnvironment from 'jest-environment-node';

class FakeEnvironment extends NodeEnvironment {
  async handleEvent() {}
}

export default createEnvMixin(FakeEnvironment);
