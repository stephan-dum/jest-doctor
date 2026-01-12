it('leaks a promise', () => {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  new Promise<void>((resolve) => {
    setImmediate(resolve);
  });
});
