import saveRequire from '../utils/saveRequire';
import createEnvMixin from '../createEnvMixin';

const NodeEnvironment = saveRequire('jest-environment-node');
export default createEnvMixin(NodeEnvironment);
