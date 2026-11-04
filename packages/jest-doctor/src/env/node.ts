import saveRequire from '../utils/saveRequire';
import createEnvironment from '../createEnvironment';

const NodeEnvironment = saveRequire('jest-environment-node');
export default createEnvironment(NodeEnvironment);
