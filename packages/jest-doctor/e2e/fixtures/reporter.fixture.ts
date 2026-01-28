it('produces errors', async () => {
  jest.useRealTimers();
  await new Promise((resolve) => {
    setTimeout(resolve, 100);
  });

  setTimeout(() => {});

  jest.useFakeTimers();
  void new Promise((resolve) => {
    setTimeout(resolve, 100);
  });

  process.stdout.write('leak');
  console.log('leak');
});
