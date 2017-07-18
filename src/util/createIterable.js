export const createIterable = it => ({
  [Symbol.iterator]: () => it,
});

export const createAsyncIterable = it => ({
  [Symbol.asyncIterator]: () => it,
});

export default createIterable;
