import * as operators from './operator';

// Let's don't test lt/gt, as they're too obvious

describe('range', () => {
  it('should return appropriate results', () => {
    expect(operators.range(0, 100)).toEqual([
      { type: '>', value: 0, equal: false },
      { type: '<', value: 100, equal: false },
    ]);
    expect(operators.range(1, 90, true, false)).toEqual([
      { type: '>', value: 1, equal: true },
      { type: '<', value: 90, equal: false },
    ]);
    expect(operators.range(10, 90, true, true)).toEqual([
      { type: '>', value: 10, equal: true },
      { type: '<', value: 90, equal: true },
    ]);
  });
  it('should invert range if gt and lt are inverted', () => {
    expect(operators.range(100, 0)).toEqual([
      { type: '<', value: 0, equal: true },
      { type: '>', value: 100, equal: true },
    ]);
    expect(operators.range('aa', 1, true, false)).toEqual([
      { type: '<', value: 1, equal: true },
      { type: '>', value: 'aa', equal: false },
    ]);
  });
  it('should return equal or empty if both are equal', () => {
    expect(operators.range(0, 0, false, false)).toEqual([]);
    expect(operators.range(0, 0, true, false)).toEqual([]);
    expect(operators.range(0, 0, true, true)).toEqual([
      { type: '=', value: 0 },
    ]);
  });
});

describe('eq', () => {
  it('should return right value', () => {

  });
  it('should sort values', () => {

  });
  it('should filter same values', () => {

  });
});

describe('neq', () => {
  it('should return right value', () => {

  });
  it('should sort values', () => {

  });
  it('should filter same values', () => {

  });
});

describe('not', () => {

});

// Aka union
describe('or', () => {

});

// Aka intersect
describe('and', () => {

});

// Why do we need this?
// or(except(a, b), except(b, a)) == xor(a, b)
describe('except', () => {

});
