import NodeEnvironment from 'jest-environment-node';
import createEnvMixin from 'jest-doctor/createEnvMixin';

class FakeEnvironment extends createEnvMixin.default(NodeEnvironment) {
  constructor(...args) {
    super(...args);
    delete this.fakeTimersModern;
  }
}

export default FakeEnvironment;
