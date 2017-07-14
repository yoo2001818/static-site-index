export default class MemoryBackend {
  constructor() {
    this.manifest = null;
    this.entries = {};
  }
  async getManifest() {
    return this.manifest;
  }
  async setManifest(data) {
    this.manifest = data;
  }
  // Name 'null' is reversed to primary data storage, which stores actual data
  // instead of bunch of PKs
  // ID 0 is reserved to index-specific metadata
  // TODO Wouldn't it be better to create specialized object for specific
  // index? Although since they need disk access, it won't matter at all
  // I think.
  async getIndexEntry(name, id) {
    let key = name + '-' + id;
    return this.entries[key];
  }
  async setIndexEntry(name, id, data) {
    // Data 'undefined' deletes the entry
    let key = name + '-' + id;
    this.entries[key] = data;
  }
  // Commit all cache to disk (Which does nothing in memory backend)
  async commit() {
    
  }
}
