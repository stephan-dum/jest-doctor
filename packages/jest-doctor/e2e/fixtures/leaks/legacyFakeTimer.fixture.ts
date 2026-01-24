const fnToTest = () => {
  setTimeout(() => {});
  setInterval(() => {});
};

jest.useFakeTimers({ legacyFakeTimers: true });

it('does still detect leeks if legacy fake timer are reset', () => {
  jest.useRealTimers();
  fnToTest();
});

export {};
