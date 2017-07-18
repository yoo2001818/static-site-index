// Does it really need to reside in a single file?
export default function extractKeys(index, document) {
  const { keys } = index;
  if (keys.length === 1) return document[keys[0]];
  else return keys.map(v => document[v]);
}
