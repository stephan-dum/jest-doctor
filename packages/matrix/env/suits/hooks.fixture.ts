it('sets up a timer', () => {
  jest.useFakeTimers();
  setTimeout(() => {}, 100);
});

afterEach(() => {
  jest.runAllTimers();
});
