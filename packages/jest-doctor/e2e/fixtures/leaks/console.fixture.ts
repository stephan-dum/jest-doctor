const fnToTest = () => {
  console.log('oops');
};

describe('incorrect console usage', () => {
  it('emits console output', () => {
    fnToTest();
  });
});

describe('correct console usage', () => {
  it('should spy on console and mock implementation to avoid a leak', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    fnToTest();
    expect(consoleSpy).toHaveBeenCalledWith('oops');
  });
});

export {};
