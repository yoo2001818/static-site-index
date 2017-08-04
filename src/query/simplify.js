export default function simplifyQuery(query) {
  // Traverse every property of the query and try to simplify it to use
  // 'simple' operators.
  // The output is a 3D array - Each axis is for AND, OR, AND.
  // Each subset is expected to return 3D array too. It'll be merged then.
  return processSubset(query, false);
}

function processSubset(query, invert = false) {
  let output = [];
  for (let key in query) {
    switch (key) {
      case '$and':
        break;
      case '$not':
        break;
      case '$or':
        break;
      case '$nor':
        break;
      default:
        break;
    }
  }
  return output;
}
