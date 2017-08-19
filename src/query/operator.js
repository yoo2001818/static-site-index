import { compare as compareValues } from '../util/comparator';

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
  // [ > 1, < 3 ] should be converted to 1 >= n or n <= 3.
  // Simply put, this should be run like this:
  // - > and < should be inverted, along with 'equal'.
  // - If = is met outside, set '*' flag. If > and < is not met until the end,
  //   insert '*' operator at the first. Then, convert it to !=.
  // - If * is met, remove it.
  // - If != is met inside, change it to =. 

  // Special case: empty array
  if (query.length === 0) return [{ type: '*' }];
  // We need to search the first < or > to detect what should it be, but does
  // it really have to be two-pass? There should be a way to do it in one pass.
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
