import MemoryBackend from './backend/memory';
import BPlusTree from 'async-btree/lib/bplustree';
import createComparator from './util/comparator';

export default class Index {
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
        this.manifest = manifest || {
          populated: false,
          indexes: [],
        };
        this.btrees = this.manifest.indexes.map(this._createIndex.bind(this));
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
  _createIndex(index) {
    // Create the index object - an actual B+Tree object, along with its
    // comparator code.
    // Note that the B+Tree implementation treats keys and values separately -
    // the backend is responsible for synchronizing keys and values, since it
    // can simply copy / paste while loading. 'primary' index should be treated
    // differently, though.
    let btree = new BPlusTree(
      null, // TODO
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
  }
  async addIndex(index) {
    await this.getManifest();
  }
  async removeIndex(index) {
    await this.getManifest();
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
  async commit() {
    // If manifest doesn't exist, it can be ignored since nothing is written or
    // read.
    if (this.manifest === undefined) return;
  }
  // Queries
  async explain(query) {
    await this.getManifest();
  }
  async search(query) {
    await this.getManifest();
  }
}
