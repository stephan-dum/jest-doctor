it('leaks', () => {
  jest.useFakeTimers();

  setTimeout(() => {
    console.log('leaks');
  }, 1000);
});

it('is clean', () => {
  jest.runAllTimers();
});
