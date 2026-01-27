import { type OutputOptions, JestDoctorEnvironment } from '../types';
import getStack from '../utils/getStack';
import isIgnored from '../utils/isIgnored';
const patchProcessOutput = (
  that: JestDoctorEnvironment,
  outputOptions: OutputOptions,
) => {
  const createOutputPatch = (method: 'stderr' | 'stdout') => {
    const patch: NodeJS.WritableStream['write'] = (...args) => {
      const stack = getStack(patch);
      if (!stack.includes('node_modules/@jest/console')) {
        const owner = that.currentTestName;
        const message = args[0].toString();

        if (!isIgnored(message, outputOptions.ignore)) {
          that.leakRecords.get(owner)?.processOutputs.push({
            method,
            stack,
          });
        }
      }

      return that.original.process[method](
        ...(args as Parameters<NodeJS.WritableStream['write']>),
      );
    };

    return patch;
  };

  outputOptions.methods.forEach((method) => {
    process[method].write = createOutputPatch(method);
  });
};

export default patchProcessOutput;
