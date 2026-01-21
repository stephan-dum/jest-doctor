it('produces errors', async () => {
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
