import { gt, lt, range, eq, neq, not, or, and } from './operator';

export default function simplifyQuery(query) {
  // Traverse every property of the query and try to simplify it to check it
  // against the indexes.
  // It returns a retrieval range of each key. After that, the retrieval costs
  // will be calculated for each keys.
  return processSubset(query);
}

function objectEach(src, op) {
  let output = {};
  for (let key in src) {
    output[key] = op(src[key], key);
  }
  return output;
}

function mergeSubset(dest, src, op) {
  for (let key in src) {
    dest[key] = op(dest[key], src[key], key);
  }
}

function processSubset(query) {
  let keys = {};
  for (let key in query) {
    // TODO Handle arrays
    switch (key) {
      case '$and':
        mergeSubset(keys, processSubset(query[key]), and);
        break;
      case '$not':
        mergeSubset(keys, not(processSubset(query[key])), and);
        break;
      case '$or':
        mergeSubset(keys, processSubset(query[key]), or);
        break;
      case '$nor':
        // Uhh I don't get it
        break;
      default:
        break;
    }
  }
  return keys;
}
