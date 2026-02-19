jest.useFakeTimers();
beforeEach(() => {
  setTimeout(() => {}, 100);
});
it('sets up a timer', () => {
  setTimeout(() => {}, 100);
});

afterEach(() => {
  jest.runAllTimers();
});
