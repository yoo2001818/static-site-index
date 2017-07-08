import MemoryBackend from './backend/memory';

export default class Index {
  constructor(backend = new MemoryBackend(), config = {}) {
    // TODO Set the size to bigger value - this is only for testing.
    const { key = 'id', size = 2 } = config;
    this.backend = backend;
    this.config = { key, size };
    // TODO Load manifest information
    // TODO Manage each indexes
    // TODO Query builder
    // TODO Data manager
    // TODO Syncing
  }
  // Index manangement functions
  addIndexes(indexes) {

  }
  addIndex(index) {

  }
  removeIndex(index) {

  }
  // Data management functions
  add(document) {

  }
  remove(document) {

  }
  get(pk) {

  }
  commit() {

  }
  // Queries
  explain(query) {

  }
  search(query) {

  }
}
