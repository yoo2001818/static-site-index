# Structure
The database can be composed of many indexes. Searching the database requires
selecting the right indexes to optimize its operation. After determining
strategies to execute the query, we can simply execute them in order like a
pipe.

## Document
Document equals to a single JSON document - which is convinient to use in most
languages. A document may contain an array, or an object, or an actual value
(string, number, boolean, null).

If an array is specified, its entries will be inserted into the indexes
requesting values inside the array. The index's rows will increase by the
array's length.

It may be good to use DFS to populate the index with bulk insertion.

## Query
Queries consist of a where clause and a order clause. Where clause filters out
unwanted values, while order clause orders the database.
There is also distinct clause, which filters the same value repeating over and
over again for specified columns. But that's really simple to implement, if the
array is sorted in order. Otherwise, quicksort in the memory!

### Query Structure
Queries use some kind of mixture of between MongoDB and Sequelize. The whole
query is represented using a single JS object, unlike MongoDB.

```js
{
  where: {
    id: {
      $eq: 1,
      $gt: 1,
      $gte: 1,
      $lt: 1,
      $lte: 1,
      $ne: 1,
      $in: [1, 2],
      $nin: [1, 2],
    },
    $or: [
      { name: { $lt: 4 } },
      { name: { $gt: 4 } },
    ],
    $and: [ /* ... */ ],
    $not: {
      title: "hello",
    },
    body: { $exists: true },
    views: {
      $mod: [3, 1],
      $regex: /1/g,
    },
    tags: {
      $all: ['a', 'b', 'c'],
      $size: {
        $lt: 3,
        $gt: 2,
      },
    },
    footer: {
      copyright: 'MIT',
    },
    $where: (doc) => true,
  },
  order: [
    ['id', -1],
    // ['id', 1],
  ],
  distinct: ['id', 'title'],
}
```

## Query Parsing
After the query is passed to the database, The database should divide it down
to much simpler representation. This is unrelated from the indexes, instead,
it's an 3D array... first array is for AND logic, 2nd array is for OR logic,
and 3nd array is for AND logic.

Each operator is laid out, but NOT is not permitted - it must be changed to
different operators. e.g. `lte` should be converted to `gt`.

```js
// This transforms to...
{
  where: {
    a: { $in: [1, 2] },
    b: { $lte: 3, $gte: 5 },
    c: { $not: { $gte: 4 } },
    $or: [
      { d: 3, e: 5 },
      { d: 5, e: 3 },
    },
  },
}
// this.
[
  [
    [
      { name: 'a', operator: 'eq', value: 1 }, 
    ],
    [
      { name: 'a', operator: 'eq', value: 2 },
    ],
  ],
  [
    [
      { name: 'b', operator: 'lte', value: 3 },
      { name: 'b', operator: 'gte', value: 5 },
      { name: 'c', operator: 'lt', value: 4 },
    ],
  ],
  [
    [
      { name: 'd', operator: 'eq', value: 3 },
      { name: 'e', operator: 'eq', value: 5 },
    ],
    [
      { name: 'd', operator: 'eq', value: 5 },
      { name: 'e', operator: 'eq', value: 3 },
    ],
  ]
]
```

## Task
The indexes can perform strategies to execute the query. Each task
acts like a pipe - It may be a good idea to make each task as a Node.js
stream - but that means other environments can't use the system.
Async generators seems to be a good choice for now.

A task has zero to multiple inputs, and a single output. It can directly
read values from the indexes, or read input and process them.

### Load Task
Loads requested data from the primary key index. It may be requested as an
input, or as a config.

### Range Task
Loads the range from the index. Bottom / Top keys can be specified.

### Merge Task
Merges two or more as a index. Returns them in an order, as long as inputs are
all sorted. Sorting function must be provided in the config.

### Sort Task
Holds all the values until all inputs are drained, then returns sorted output.
Extremely inefficient, yet required. Sorting function must be provided in the
config.

### Filter Task
Filters the values according to the function.

### Dedupe Task
Dedupes the values according to the "wanted" keys - if the tuple is already
registered on the hashmap, it simply ignores that value.
