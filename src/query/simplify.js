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

function forEach(obj, callback) {
  if (Array.isArray(obj)) {
    obj.forEach(callback);
  } else {
    callback(obj);
  }
}

function processSubset(query) {
  let keys = {};
  for (let key in query) {
    switch (key) {
      case '$and':
        forEach(query[key], v => mergeSubset(keys, processSubset(v), and));
        break;
      case '$nor':
      case '$not':
        // Technically !(A || B) = (!A) && (!B), but this feels weird.
        forEach(query[key], v => mergeSubset(keys, not(processSubset(v)), and));
        break;
      case '$or':
        forEach(query[key], v => mergeSubset(keys, processSubset(v), or));
        break;
      default:
        break;
    }
  }
  return keys;
}
