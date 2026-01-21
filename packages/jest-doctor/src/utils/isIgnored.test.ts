import isIgnored from './isIgnored';

it('returns true if ignore matches regexp', () => {
  const result = isIgnored('oops', [/ops/]);
  expect(result).toEqual(true);
});
it('returns true if ignore matches string', () => {
  const result = isIgnored('oops', ['ops']);
  expect(result).toEqual(true);
});
it('returns false if it doesnt match', () => {
  const result = isIgnored('oops', [/fu/, 'bar']);
  expect(result).toEqual(false);
});
