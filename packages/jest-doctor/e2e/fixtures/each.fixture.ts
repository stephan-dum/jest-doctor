describe('incorrect console usage', () => {
  it.each(['item 1', 'item 2'])('test item %s', (item) => {
    console.log(item);
  });
});

describe('correct console usage', () => {
  it.each(['item 1', 'item 2'])('test item %s', (item) => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    console.log(item);
    expect(consoleSpy).toHaveBeenCalledWith(item);
  });
});

export {};
