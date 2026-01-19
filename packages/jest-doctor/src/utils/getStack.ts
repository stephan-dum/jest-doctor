const getStack = (stackFrom: Function, prefix: string) => {
  const error = {
    stack: '',
  };

  Error.captureStackTrace(error, stackFrom);

  return prefix + ' ' + error.stack.replace(/\\/g, '/');
};

export default getStack;
