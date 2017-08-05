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

export function union(n) {

}

export function intersection(n) {

}
