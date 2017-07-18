import MemoryBackend from './backend/memory';
import BPlusTree from 'async-btree/lib/bplustree';
import TreeAdapter from './treeAdapter';
import createComparator, { indexComparator } from './util/comparator';
import { createAsyncIterable } from './util/createIterable';
import extractKeys from './util/extractKeys';

export default class Database {
  constructor(backend = new MemoryBackend(), config = {}) {
    // TODO Set the size to bigger value - this is only for testing.
    const { key = 'id', size = 2 } = config;
    this.backend = backend;
    this.config = { key, size };
    this.manifest = undefined;
    // Load manifest information..
    this.manifestPromise = backend.getManifest()
      .then(manifest => {
        // If the manifest is missing, provide initialization data.
        // The indexes are sorted in created order, so we have to sort them
        // using a score to create query plan.
        this.manifest = manifest || {
          indexes: [
            { id: 0, name: null, keys: [key], root: null, nodes: 0 },
          ],
        };
        this.btrees = this.manifest.indexes.map(this._createIndex.bind(this));
        // Create score-ordered index array.
        this.indexesScore = this.manifest.indexes.slice();
        this.indexesScore.sort(indexComparator);
        return manifest;
      });
    this.btrees = [];
    // TODO Manage each indexes
    // TODO Query builder
    // TODO Data manager
    // TODO Syncing
  }
  getManifest() {
    if (this.manifest !== undefined) return Promise.resolve(manifest);
    return this.manifestPromise;
  }
  setManifest(data) {
    this.manifest = data;
    return this.backend.setManifest(data);
  }
  _createIndex(index) {
    if (index == null) return null;
    // Create the index object - an actual B+Tree object, along with its
    // comparator code.
    // Note that the B+Tree implementation treats keys and values separately -
    // the backend is responsible for synchronizing keys and values, since it
    // can simply copy / paste while loading. 'primary' index should be treated
    // differently, though.
    let btree = new BPlusTree(
      new TreeAdapter(this, index),
      this.config.size,
      createComparator(index),
    );
   return btree;
  }
  // Index manangement functions
  addIndexes(indexes) {
    // Since each index doesn't touch other indexes at all, we can run this
    // in parallel - but manifest modifying should be an atomic operation in
    // order to do that.
    return Promise.all(indexes.map(v => this.addIndex(v)));
  }
  async addIndex(keysArg) {
    await this.getManifest();
    // TODO Validate keys
    let keys;
    if (keysArg[keysArg.length - 1] === this.config.key) keys = keysArg;
    else keys = keysArg.concat(this.config.key);
    // Check if indexes array has exactly same entry as provided keys. If it
    // already exists, silently fail. (What)
    if (this.manifest.indexes.some(index => {
      if (index == null) return false;
      if (index.keys.length !== keys.length) return false;
      return index.keys.every((v, i) => v === keys[i]));
    })) return false;
    let indexId = this.manifest.indexes.indexOf(null);
    if (indexId === -1) indexId = this.manifest.indexes.length;
    // Create an index entry and push it and its B+Tree into array.
    let index = {
      id: indexId,
      // The name should be unique enough yet short enough. We'll use its ID
      // for now.
      name: indexId,
      keys,
      root: null,
      nodes: 0,
    };
    let btree = this._createIndex(index);
    this.manifest.indexes[indexId] = index;
    this.btrees[indexId] = btree;
    // Now, we have to provision the index. This is done before adding the
    // index to scored indexes array to prevent accidentally accessing unloaded
    // indexes by search queries, though the DB isn't designed to support
    // locking mechanism.
    // Traverse whole PK tree and insert the values...
    for await (let document of this.btrees[0]) {
      await btree.insert(extractKeys(index, document), document);
    }
    // All done, sync the manifest file. (This will be done by B+Tree though)
    await this.setManifest(this.manifest);
    // After this, add the index in appropriate position in the indexesScore
    // array. Since this is not a linked array, we have to shift all other
    // indexes.
    let i;
    for (i = this.indexesScore.length + 1; i > 0; --i) {
      // Stop if selected index is higher than the new index.
      // TODO I'm not sure about the order
      if (indexComparator(this.indexesScore[i - 1], index) > 0) break;
      this.indexesScore[i] = this.indexesScore[i - 1];
    }
    this.indexesScore[i] = index;
    // Commit the database.
    await this.commit();
    return true;
  }
  async removeIndex(keysArg) {
    await this.getManifest();
    // TODO Validate keys
    let keys;
    if (keysArg[keysArg.length - 1] === this.config.key) keys = keysArg;
    else keys = keysArg.concat(this.config.key);
    // Find the index with the provided keys.
    let index = this.manifest.indexes.find(index => {
      if (index == null) return false;
      if (index.keys.length !== keys.length) return false;
      return index.keys.every((v, i) => v === keys[i]));
    });
    if (index == null) return false;
    let btree = this.btrees[index.id];
    if (btree == null) throw new Error('Assertion error: B-Tree is null');
    // Remove the index from the array to prevent other 'threads' from using
    // collapsing B-Tree.
    // Since the ID is linked to index's position, we can't splice it - instead
    // set to null. This will be filled by new indexes.
    this.manifest.indexes[index.id] = null;
    this.btrees[index.id] = null;
    // Why is this immutable?
    this.indexesScore = this.indexesScore.filter(v => v !== index);
    // We have to garbage collect all the nodes associated with the index.
    // Iterate through the nodes of the B-Tree to remove all of them.
    // TODO This could be done in parallel to make it faster.
    for await (let node of createAsyncIterable(btree.iteratorNodesAll())) {
      // Remove the node.
      await btree.io.remove(node.id);
    }
    await this.commit();
    // All done!
    return true;
  }
  // Data management functions
  async add(document) {
    await this.getManifest();
  }
  async remove(document) {
    await this.getManifest();
  }
  async get(pk) {
    await this.getManifest();
  }
  commit() {
    // If manifest doesn't exist, it can be ignored since nothing is written or
    // read.
    if (this.manifest === undefined) return;
    return this.backend.commit();
  }
  // Queries
  async explain(query) {
    await this.getManifest();
  }
  async search(query) {
    await this.getManifest();
  }
}
