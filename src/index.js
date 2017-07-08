import MemoryBackend from './backend/memory';

export default class Index {
  constructor(backend = new MemoryBackend()) {
    this.backend = backend;
    // TODO Load manifest information
    // TODO Manage each indexes
    // TODO Query builder
    // TODO Data manager
    // TODO Syncing
  }
  loadManifest() {
    
  }
}
