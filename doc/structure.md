# Structure
The database can be composed of many indexes. Searching the database requires
selecting the right indexes to optimize its operation. After determining
strategies to execute the query, we can simply execute them in order like a
pipe.

## Document
Document equals to a single JSON document - which is convinient to use in most
languages. A dcument may contain an array, or an object, or an actual value
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

It may use probabilistic algorithm to reduce the memory load.
