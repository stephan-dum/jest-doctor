import JsdomEnvironment from 'jest-environment-jsdom';
import createEnvMixin from '../createEnvMixin.cjs';

export default createEnvMixin(JsdomEnvironment);
