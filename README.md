# static-site-index
Scalable B+Tree indexing for static websites 

Static websites often lack searching - because searching is not trivial to
implement because they don't have databases and servers. 

Searching can be done by implementing indexes in client side. Unlike most
already existing search engines employing full text search,
*static-site-index* uses B+Tree, allowing SQL-like queries and only downloading
required data, by spreading the index over files. However, this means that it
doesn't support full text search, so please use full text search engines for
that.

This allows the index to be used in large-scale data, since everything doesn't
have to be on single file - and the index can be mutated by overwriting `log N`
files.

**The project is work in progress. Do not use it unless you want to see a lot
of bugs.**

**Furthermore, this document is only for planning - nothing is implemented
yet!**

## Usage
First, you need to load `static-site-index` and a appropriate filesystem
backend, along with basic schema of the index.

```js
import Index from 'static-site-index';

// Node.js fs backend
import FsBackend from 'static-site-index/lib/backend/fs';
let backend = new FsBackend('./indexes'); // Indexes directory

// DOM fetch backend
import FetchBackend from 'static-site-index/lib/backend/fetch';
let backend = new FetchBackend('./indexes'); // Indexes directory

let index = new Index(backend, {
  // The primary key (unique identifier) of the document.
  // This will be indexed by default.
  key: 'id',
  // The single node size of B+Tree. 
  size: 20,
});
```

### Modifying Indexes
Since the index can contain many B+Tree indexes, the indexes information is
stored in its manifest file. You can add / remove indexes like this.
If there are data in indexes, it may take a while since it needs to generate
indexes for already existing data.

```js
index.addIndexes([
  ['tags'], // { tags: '...' }, { tags: ['...'] } will be indexed
  ['name', 'tags'], // ('name', 'tags') tuple
  ['language', 'name', 'date'], // ('language', 'name', 'date') tuple
  ['author.name'], // { author: [{ name: '...' }] } will be indexed
]); // Returns a Promise

index.addIndex(['name']); // Returns a Promise
index.removeIndex(['name']); // Returns a Promise
```

### Modifying Data
After the index is created, you can add / remove data from the index,
if the backend allows to do so. (DOM fetch backend can't use this.)

**Do not modify the index from multiple places at the same time - The index
doesn't provide any locking mechanism (yet)! This applies to same process
having multiple index objects, too.**

But overwriting the index for each update is inefficient. So after everything
is done, you have to call `commit` to write changed data to the filesystem.

```js
// Only provide metadatas for the document - the index shouldn't store the
// entire data, although it's capable of doing that.
let document = {
  id: 'somethingsomething',
  tags: ['hello', 'world'],
  language: 'en-US',
  author: { name: 'Nobody', email: 'hello@example.com' },
  // Please use timestamp for this, although it will be converted:
  date: 123456789,
};

index.add(document); // Returns a Promise.
// Even if you provide full document, the index doesn't trust the data's
// integrity and it'll load the data from the filesystem.
index.remove(document); // Returns a Promise.
index.remove('somethingsomething'); // Returns a Promise.

index.commit()
.then(() => console.log('All done!'));
```

### Querying Indexes
After inserting some data, you can actually query the index from datas.

```js
index.search({
  where: {
    id: {
      $gt: 'aa',
      $lt: 'zz',
    },
    tags: ['a', 'b'], // Contains both a, b
    /*
    tags: {
      $in: ['a', 'b'], // Contains a or b
    },
    tags: {
      $gte: 'a',
      $lte: 'b',
    },
    */
    author: {
      name: 'hello',
    },
    language: { $not: 'en-US' },
  },
  order: ['date', 'name'],
}).then(async iterator => {
  // Skip some values
  let { done } = await iterator.skip(10);
  // Other than 'skip', the iterator is an async iterator.
  let { value, done } = await iterator.next();
  console.log(value, done);
  // https://github.com/tc39/proposal-async-iteration
  for await (const entry of iterator) {
    console.log(entry);
  }
});

// If you want to use the index for storing the data, this is possible too.
index.get('somethingsomething') // Returns a Promise
```

### Explain Queries
You might want to know how the query is executed. 

```js
// Just one match
index.explain({
  where: {
    id: '32',
  }
}).then(result => {
  expect(result).toEqual([
    {
      index: ['id'],
      type: 'match',
    },
  ]);
});

// Range query
index.explain({
  where: {
    id: {
      $gte: 1,
      $lte: 100,
    },
  }
}).then(result => {
  expect(result).toEqual([
    {
      index: ['id'],
      type: 'range',
    },
  ]);
});

// Range and match query
index.explain({
  where: {
    id: { $gte: 1, $lte: 100 },
    tags: ['a', 'b'], // Contains both a, b
  }
}).then(result => {
  expect(result).toEqual([
    {
      index: ['id'],
      type: 'range',
    },
    {
      // Test against indexes, instead of retrieving the whole data
      index: ['tags'],
      type: 'match',
    },
  ]);
});

// Index doesn't exist, full scan
index.explain({
  where: {
    text: 'Hello world!',
  }
}).then(result => {
  expect(result).toEqual([
    {
      index: null,
      type: 'scan',
    },
  ]);
});

```
