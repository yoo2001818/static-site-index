// Creates generalized comparator using a key.
export default function createComparator(index) {
  const { keys } = index;
  // Create an comparator.
  return (a, b) => {
    // Compare each keys, return if non-zero.
    for (let i = 0; i < keys.length; ++i) {
      let key = keys[i];
      let compared = compare(a[key], b[key]);
      if (compared !== 0) return compared;
    }
    return 0;
  };
}

// Compares which index has higher order, which will be compared against the
// query first.
export function indexComparator(a, b) {
  let keyLen = compare(a.keys.length, b.keys.length);
  if (keyLen !== 0) return -keyLen;
  // TODO Data size
  return -compare(a.id, b.id);
}

function compare(a, b) {
  // TODO Compare non-number, non-string values
  if (a > b) return 1;
  if (a < b) return -1;
  return 0;
}
