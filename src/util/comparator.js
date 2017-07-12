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

function compare(a, b) {
  // TODO Compare non-number, non-string values
  if (a > b) return 1;
  if (a < b) return -1;
  return 0;
}
