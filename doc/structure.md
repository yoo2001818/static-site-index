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

## Strategies
The indexes can perform following strategies to execute the query. Each strategy
acts like a pipe - It may be a good idea to make each strategy as a Node.js
stream - but that means other environments can't use the system.
Async generators seems to be a good choice for now.

A strategy has zero to multiple inputs, and a single output. It can directly
read values from the indexes, or read input and process them.
