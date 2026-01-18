const fnToTest = () => {
  setTimeout(() => {});
  setInterval(() => {});
};

describe('incorrect usage of timers', () => {
  it('leaks timeout', () => {
    fnToTest();
  });
});

describe('correct usage of timers', () => {
  it('should enable fake timers and advance or clear them', () => {
    jest.useFakeTimers();
    fnToTest();
    jest.clearAllTimers();
  });
});

export {};
