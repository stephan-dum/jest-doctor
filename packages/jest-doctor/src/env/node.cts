import NodeEnvironment from 'jest-environment-node';
import createEnvMixin from '../createEnvMixin.cjs';

export default createEnvMixin(NodeEnvironment);
