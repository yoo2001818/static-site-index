import MemoryBackend from './backend/memory';
import BPlusTree from 'async-btree/lib/bplustree';
import TreeAdapter from './treeAdapter';
import createComparator, { indexComparator } from './util/comparator';

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
  async addIndex(keys) {
    await this.getManifest();
    // Check if indexes array has exactly same entry as provided keys. If it
    // already exists, silently fail. (What)
    if (this.manifest.indexes.some(index => {
      if (index.keys.length !== keys.length) return false;
      return !index.keys.every((v, i) => v === keys[i]));
    })) return false;
    // Create an index entry and push it and its B+Tree into array.
    let index = {
      id: this.manifest.indexes.length,
      // The name should be unique enough yet short enough. We'll use its ID
      // for now.
      name: this.manifest.indexes.length,
      keys,
      root: null,
      nodes: 0,
    };
    let btree = this._createIndex(index);
    this.manifest.indexes.push(index);
    this.btrees.push(btree);
    // Now, we have to provision the index. This is done before adding the
    // index to scored indexes array to prevent accidentally accessing unloaded
    // indexes by search queries, though the DB isn't designed to support
    // locking mechanism.
    
    // TODO We have to traverse whole PK tree and insert the values...

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
  }
  async removeIndex(index) {
    await this.getManifest();
    // We have to garbage collect all the nodes associated with the index.
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
