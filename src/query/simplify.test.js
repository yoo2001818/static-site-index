import { gt, lt, range, eq, neq, not, or, and } from './operator';
import simplify from './simplify';

describe('simplify', () => {
  it('should handle simple equal query', () => {
    expect(simplify({ a: 5, b: 3 })).toEqual({
      a: eq([5]),
      b: eq([3]),
    });
    expect(simplify({ a: { $eq: 5 }, b: { $eq: 3 } })).toEqual({
      a: eq([5]),
      b: eq([3]),
    });
  });
  it('should handle simple neq query', () => {
    expect(simplify({ a: { $neq: 5 }, b: { $neq: 3 } })).toEqual({
      a: neq([5]),
      b: neq([3]),
    });
    expect(simplify({
      a: { $not: { $eq: 5 } }, b: { $not: { $eq: 3 } },
    })).toEqual({
      a: neq([5]),
      b: neq([3]),
    });
    expect(simplify({ a: { $not: 5 }, b: { $not: 3 } })).toEqual({
      a: neq([5]),
      b: neq([3]),
    });
  });
  it('should handle simple range query', () => {
    expect(simplify({ a: { $gt: 1 }, b: { $lte: 7 } })).toEqual({
      a: gt(1),
      b: lt(7, true),
    });
    expect(simplify({
      a: { $gte: 1, $lt: 9 }, b: { $gt: 6, $lte: 7 },
    })).toEqual({
      a: range(1, 9, true),
      b: range(6, 7, false, true),
    });
  });
  it('should handle simple range query not', () => {
    expect(simplify({
      a: { $not: { $gte: 1, $lt: 9 } }, b: { $not: { $gt: 6, $lte: 7 } },
    })).toEqual({
      a: range(9, 1, false, true),
      b: range(7, 6, true, false),
    });
  });
  it('should handle in query', () => {
    expect(simplify({
      a: { $in: [1, 2, 3, 5] }, b: { $in: [3, 6, 9] },
    })).toEqual({
      a: eq([1, 2, 3, 5]),
      b: eq([3, 6, 9]),
    });
    expect(simplify({
      a: { $nin: [1, 2, 3, 5] }, b: { $nin: [3, 6, 9] },
    })).toEqual({
      a: neq([1, 2, 3, 5]),
      b: neq([3, 6, 9]),
    });
    expect(simplify({
      a: { $not: { $in: [1, 2, 3, 5] } },
      b: { $not: { $in: [3, 6, 9] } },
    })).toEqual({
      a: neq([1, 2, 3, 5]),
      b: neq([3, 6, 9]),
    });
  });
});
