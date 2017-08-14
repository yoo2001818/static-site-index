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
// There are these types of instructions: <, >, ==, !=.
// It's pretty self explainary. < and > continues until they meet corresponding
// > or <. != ignores the specific value in the range. You can see it as a very
// specific < and >.
//
// [ > 1, < 3 ] means 1 < n < 3.
