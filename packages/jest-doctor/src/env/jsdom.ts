import saveRequire from '../utils/saveRequire';
import createEnvMixin from '../createEnvMixin';

const JSDOMEnvironment = saveRequire('jest-environment-jsdom');

export default createEnvMixin(JSDOMEnvironment);
