import saveRequire from '../utils/saveRequire';
import createEnvironment from '../createEnvironment';
import patchDOMListeners from '../patch/domListeners';

const JSDOMEnvironment = saveRequire('jest-environment-jsdom');

class JSDOMJestDoctorEnvironment extends createEnvironment(JSDOMEnvironment) {
  async setup() {
    await super.setup();

    if (this.options.report.domListeners) {
      patchDOMListeners(this, this.options.report.domListeners);
    }
  }
}

export default JSDOMJestDoctorEnvironment;
