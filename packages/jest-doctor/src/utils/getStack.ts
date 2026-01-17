const cwd = process.cwd();

const getStack = (stackFrom: Function) => {
  const error = {
    stack: '',
  };

  Error.captureStackTrace(error, stackFrom);

  const lines = error.stack.split('\n');
  lines.shift();

  for (const line of lines) {
    if (line.includes(cwd) && !line.includes('node_modules')) {
      return line.trim();
    }
  }

  return '';
};

export default getStack;
