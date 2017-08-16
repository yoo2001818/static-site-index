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
