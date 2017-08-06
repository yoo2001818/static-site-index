import { compare } from '../util/comparator';

// Operators are used to plan the query; User written JSONs are converted to
// JSON with these operators.
//
// Currently, these operators are supported:
// { type: 'eq', values: [1, 2, 3] }
// { type: 'ne', values: [1, 2, 3] }
// { type: 'lt', value: 0, equal: true },
// { type: 'gt', value: 10, equal: false },
// { type: 'range', gt: 0, lt: 10, gte: true, lte: true, split: false }
// true
// false
//
// true and false are used for never-failing or ever-failing operators. It'll
// be filtered out by the query planner then.
//
// Range operators have these states:
// - (N, M), [N, M), (N, M], [N, M] (N < M. If N = M: change it to eq.)
// - (-Infinity, N) AND (M, Infinity).
//
// NOT operators are not supported, i.e. NOT (N < 3) is converted to N >= 3.

export function invert(n) {
  if (typeof n === 'boolean') return !n;
  switch (n.type) {
    case 'eq':
      return Object.assign({}, n, { type: 'ne' });
    case 'ne':
      return Object.assign({}, n, { type: 'eq' });
    case 'lt':
      return Object.assign({}, n, { type: 'gt', equal: !n.equal });
    case 'gt':
      return Object.assign({}, n, { type: 'lt', equal: !n.equal });
    case 'range':
      return {
        type: 'range',
        gt: n.lt,
        lt: n.gt,
        gte: !n.lte,
        lte: !n.gte,
        split: !n.split,
      };
    default:
      return true;
  }
}

const PAIR_BIT_FLAGS = {
  eq: 1,
  ne: 2,
  lt: 4,
  gt: 4,
  range: 8,
};

export function union(a, b) {
  // Case 1. eq/eq, ne/ne - Concatenate two values.
  // Case 2. eq/ne - ne with values NE - EQ.
  // Case 3. lt/lt, gt/gt - Choose higher/lower value.
  // Case 4. lt/gt - true if gt < lt. Otherwise, range (lt < A, gt > A, split).
  // Case 5. range, both normal - Pick lowest lt / highest gt.
  // Case 6. range, both split - true if doesn't overlap. Or pick highest lt
  // and lowest gt.
  // Case 7. range, normal/split - :/
  // Case 8. range/lt, range/gt - Treat it like (Infinity, N) or (N, Infinity)
  // Case 9. lt/eq, gt/eq, range/eq - Expand range's ...range to contain all
  // the eq's value.
  // Case 10. lt/ne, gt/ne, range/ne - Always false.
  if (a === true || b === true) return true;
  if (a === false) return b;
  if (b === false) return a;

  // We need some kind of object to mark 'Infinity' and '-Infinity' to treat
  // lt and gt as a range.
  let flags = PAIR_BIT_FLAGS[a.type] | PAIR_BIT_FLAGS[b.type];
  switch (flags) {
    case 1: // eq & eq
      return {
        type: 'eq',
        // TODO Use merge-sort to merge these two arrays without duplicates
        values: a.values.concat(b.values),
      };
    case 2: // ne & ne
      return {
        type: 'ne',
        // TODO Use merge-sort to merge these two arrays without duplicates
        values: a.values.concat(b.values),
      };
    case 3: // eq & ne

      break;
    case 4: // (l|g)t & (l|g)t

      break;
    case 5: // (l|g)t & eq

      break;
    case 6: // (l|g)t & ne

      break;
    case 8: // range & range

      break;
    case 9: // range & eq

      break;
    case 10: // range & ne

      break;
    case 12: // range & (l|g)t

      break;
  }
}

export function intersection(a, b) {

}
