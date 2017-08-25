import { compare } from '../util/comparator';

// Operators are used to plan the query; User written JSONs are converted to
// JSON with these operators.
// The operator is a plot on a single axis - it performs a boolean operation on
// the single axis.
//
// Thus, it's stored in a sorted array, and the database system reads it from
// the first, quickly 'winds' the entire database while looking at the pattern.
// it can read the operators from the reverse, too.
//
// Each operator has many instructions, telling that what range/value should be
// accepted or not.
//
// There are these types of instructions: <, >, <=, >=, ==, !=.
// It's pretty self explainary. < and > continues until they meet corresponding
// > or <. != ignores the specific value in the range. You can see it as a very
// specific < and >.
//
// [ > 1, < 3 ] means 1 < n < 3.
// [ < 3 ] means -Infinity < n < 3.
//
// However, != requires that the range is already 'triggered'. For this
// purpose, special instruction '*' is used to mark that all range is
// qualified.

export function gt(value, equal = false) {
  return [
    { type: '>', value, equal },
  ];
}

export function lt(value, equal = false) {
  return [
    { type: '<', value, equal },
  ];
}

export function range(gt, lt, gte = false, lte = false) {
  return [
    { type: '>', value: gt, equal: gte },
    { type: '<', value: lt, equal: lte },
  ];
}

// This assumes that the values array is sorted.
// TODO Check if the array is sorted, and sort them if required
export function eq(values) {
  return values.map(v => ({ type: '=', value: v }));
}

export function neq(values) {
  return [{ type: '*' }].concat(
    values.map(v => ({ type: '=', value: v })));
}

export function not(query) {
  // [ > 1, < 3 ] should be converted to 1 <= n or n >= 3.
  // Simply put, this should be run like this:
  // - > and < should be inverted, along with 'equal'.
  // - If = is met outside, set '*' flag. If > and < is not met until the end,
  //   insert '*' operator at the first. Then, convert it to !=.
  // - If * is met, remove it.
  // - If != is met inside, change it to =. 

  // Special case: empty array
  if (query.length === 0) return [{ type: '*' }];
  let hasSign = false;
  let hasEqual = false;
  let output = query.map(op => {
    switch (op.type) {
      case '*':
        return null;
      case '>':
        hasSign = true;
        return { type: '<', equal: !op.equal, value: op.value };
      case '<':
        return { type: '>', equal: !op.equal, value: op.value };
      case '=':
        hasEqual = true;
        return { type: '!=', value: op.value };
      case '!=':
        return { type: '=', value: op.value };
    }
  }).filter(v => v != null);
  if (!hasSign && hasEqual) return [{ type: '*' }].concat(output);
  return output;
}

const OPERATOR_TABLE = {
  '<': { enter: false, exit: true },
  '>': { enter: true, exit: false },
  '*': { enter: true, exit: false },
  '=': { enter: false, exit: false },
  '!=': { enter: false, exit: false },
};

function compareOp(a, b) {
  // 1. Compare type. * is always smallest.
  if (a.type === '*' && b.type === '*') return 0;
  if (a.type === '*') return 1;
  if (b.type === '*') return -1;
  // 2. Compare value.
  let result = compare(a.value, b.value);
  return result;
}

export function or(a, b) {
  // Check each query's 'inside' state. Make 'inside' state large as possible.
  // This can be achieved by doing:
  // Check initial state of the queries.
  //   <, *, != means inside, and >, = means outside.
  // Compare each values of the queries, progress smaller one.
  // If both are outside and the operator enters 'inside' state,
  //   insert that to the output and set 'inside' state.
  // if only the query is inside and the operator leaves 'inside' state,
  //   insert that to the output and clear 'inside' state.
  if (a.length === 0) return b;
  if (b.length === 0) return a;
  let aInside = ['<', '*', '!='].includes(a[0].type);
  let bInside = ['<', '*', '!='].includes(b[0].type);
  let aCount = 0;
  let bCount = 0;
  let output = [];
  while (aCount < a.length && bCount < b.length) {
    // Compare both values and advance smaller one.
    // TODO Handle special case '*', or equal...
    let compared = compareOp(a[aCount], b[bCount]);
    if (compared < 0) {
      let op = a[aCount];
      let { enter, exit } = OPERATOR_TABLE[op.type];
      aInside = (aInside || enter) && (!exit);
      if (enter && !aInside && !bInside) output.push(op);
      if (exit && aInside && !bInside) output.push(op);
      aCount += 1;
    } else if (compared > 0) {
      let op = b[bCount];
      let { enter, exit } = OPERATOR_TABLE[op.type];
      bInside = (bInside || enter) && (!exit);
      if (enter && !aInside && !bInside) output.push(op);
      if (exit && !aInside && bInside) output.push(op);
      bCount += 1;
    } else {
      // Both are same - this is a special case.
      // Treat < and = as <=, and treat > and = as >=.
      aCount += 1;
      bCount += 1;
    }
  }
  // Digest remaining data.
  return output;
}
