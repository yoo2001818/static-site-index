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
  it('should handle exists query', () => {
    expect(simplify({
      a: { exists: false }, b: { exists: true },
    })).toEqual({
      a: eq([undefined]),
      b: neq([undefined]),
    });
  });
  it('should handle exists or', () => {
    expect(simplify({
      a: 1,
      b: 3,
      $or: [
        { c: 5, b: 3 },
        { c: 7, a: 5 },
      ],
    })).toEqual({
      // A becomes nothing since a: 1 and a: 5 both can't be satisfied - thus,
      // this will return zero results.
      a: [],
      b: eq([3]),
      c: eq([5, 7]),
    });
    expect(simplify({
      a: {
        $or: [1, 5, 9, { $gt: 15 }],
      },
    })).toEqual({
      a: or(eq([1, 5, 9]), gt(15)),
    });
  });
  it('should handle exists and', () => {
    expect(simplify({
      a: 1,
      b: 3,
      $and: [{
        c: 3,
      }],
    })).toEqual({
      a: eq([1]),
      b: eq([3]),
      c: eq([3]),
    });
    expect(simplify({
      a: {
        $and: [{ $gt: 15 }, { $lt: 99 }],
      },
    })).toEqual({
      a: range(15, 99),
    });
  });
  it('should handle object in object', () => {
    expect(simplify({
      pos: {
        x: 1,
        y: 2,
      },
    })).toEqual({
      'pos.x': eq([1]),
      'pos.y': eq([2]),
    });
    expect(simplify({
      pos: {
        $or: [{
          x: 1,
          y: 2,
        }, {
          dimension: { $gte: 3 },
          x: 5,
          y: 5,
        }],
      },
    })).toEqual({
      // This happens because the first one didn't specify the dimension -
      // thus, it automatically becomes '*'.
      'pos.dimension': neq([]),
      'pos.x': eq([1, 5]),
      'pos.y': eq([2, 5]),
    });
  });
});
