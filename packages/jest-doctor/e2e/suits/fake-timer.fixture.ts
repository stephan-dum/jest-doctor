it('leaks fake timeout', () => {
  jest.useFakeTimers();
  setTimeout(() => {});
  setInterval(() => {});
});
