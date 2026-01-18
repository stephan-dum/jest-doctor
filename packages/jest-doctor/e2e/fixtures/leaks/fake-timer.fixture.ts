const fnToTest = () => {
  setTimeout(() => {});
  setInterval(() => {});
};

jest.useFakeTimers();

describe('incorrect fake timer usage', () => {
  it('does not clear fake timeout after test completion', () => {
    fnToTest();
  });
});

describe('correct fake timer usage', () => {
  describe('clears fake timers with afterEach', () => {
    it('is only possible when timerIsolation is set to afterEach', () => {
      fnToTest();
    });
    afterEach(() => {
      jest.clearAllTimers();
    });
  });

  it('clears fake timers inside test', () => {
    fnToTest();
    jest.clearAllTimers();
  });
});

export {};
