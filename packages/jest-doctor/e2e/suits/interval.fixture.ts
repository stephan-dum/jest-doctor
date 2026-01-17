it('leaks normal interval', () => {
  setInterval(() => {}, 1000);
});

it('leaks fake interval', () => {
  jest.useFakeTimers();
  setInterval(() => {}, 1000);
});
