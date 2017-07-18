// Does it really need to reside in a single file?
export default function extractKeys(index, document) {
  return index.keys.map(v => document[v]);
}
