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
    expect(operators.eq([1, 2, 3])).toEqual([
      { type: '=', value: 1 },
      { type: '=', value: 2 },
      { type: '=', value: 3 },
    ]);
  });
  it('should sort values', () => {
    expect(operators.eq([1, 3, 2])).toEqual([
      { type: '=', value: 1 },
      { type: '=', value: 2 },
      { type: '=', value: 3 },
    ]);
  });
  it('should filter same values', () => {
    expect(operators.eq([1, 3, 3, 2])).toEqual([
      { type: '=', value: 1 },
      { type: '=', value: 2 },
      { type: '=', value: 3 },
    ]);
  });
});

describe('neq', () => {
  it('should return right value', () => {
    expect(operators.neq([1, 2, 3])).toEqual([
      { type: '*' },
      { type: '!=', value: 1 },
      { type: '!=', value: 2 },
      { type: '!=', value: 3 },
    ]);
  });
  it('should sort values', () => {
    expect(operators.neq([1, 3, 2])).toEqual([
      { type: '*' },
      { type: '!=', value: 1 },
      { type: '!=', value: 2 },
      { type: '!=', value: 3 },
    ]);
  });
  it('should filter same values', () => {
    expect(operators.neq([1, 3, 3, 2])).toEqual([
      { type: '*' },
      { type: '!=', value: 1 },
      { type: '!=', value: 2 },
      { type: '!=', value: 3 },
    ]);
  });
});

describe('not', () => {
  it('should invert eq/neq', () => {
    expect(operators.not(operators.eq([1, 5, 9])))
      .toEqual(operators.neq([1, 5, 9]));
    expect(operators.not(operators.neq([1, 5, 9])))
      .toEqual(operators.eq([1, 5, 9]));
  });
  it('should invert range', () => {
    expect(operators.not(operators.range(3, 8)))
      .toEqual(operators.range(8, 3));
    expect(operators.not(operators.range(3, 8, true)))
      .toEqual(operators.range(8, 3, false, true));
    expect(operators.not(operators.range(3, 8, false, true)))
      .toEqual(operators.range(8, 3, true, false));
  });
  it('should invert complex querys', () => {
    expect(operators.not([
      { type: '!=', value: 1 },
      { type: '!=', value: 2 },
      { type: '<', value: 3, equal: false },
      { type: '=', value: 4 },
      { type: '>', value: 5, equal: false },
      { type: '!=', value: 6 },
    ])).toEqual([
      { type: '=', value: 1 },
      { type: '=', value: 2 },
      { type: '>', value: 3, equal: true },
      { type: '!=', value: 4 },
      { type: '<', value: 5, equal: true },
      { type: '=', value: 6 },
    ]);
  });
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
