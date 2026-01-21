const getStack = (stackFrom: Function) => {
  const error = {
    stack: '',
  };

  Error.captureStackTrace(error, stackFrom);

  const lines = error.stack.replace(/\\/g, '/').split('\n');
  lines.shift();
  const finalStack = [];

  for (const line of lines) {
    if (
      /[/\\]/.test(line) && // this will remove all anonymous frames without a path
      !line.includes('(node:internal/') &&
      !line.includes('node_modules/jest-runtime') &&
      !line.includes('node_modules/jest-circus') &&
      !line.includes('node_modules/jest-runner') &&
      !line.includes('node_modules/jest-doctor')
    ) {
      finalStack.push(line);
    }
  }

  return finalStack.join('\n');
};

export default getStack;
