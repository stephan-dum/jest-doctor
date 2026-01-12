const getStack = (stackFrom: Function) => {
  const error = {
    stack: '',
  };
  Error.captureStackTrace(error, stackFrom);
  return error.stack;
};

export default getStack;
