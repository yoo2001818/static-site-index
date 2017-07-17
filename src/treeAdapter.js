export default class TreeAdapter {
  constructor(database, index) {
    this.database = database;
    this.backend = database.backend;
    this.index = index;
  }
  _setData() {
    // The manifest object is required to have `this.index`. If that's ensured,
    // we can simply call 'setManifest' and we're good to go.
    // TODO Is this really safe? I'd use immutable index structure...
    return this.database.setManifest(this.database.manifest);
  }
  getRoot() {
    return Promise.resolve(this.index.root);
  }
  writeRoot(id) {
    this.index.root = id;
    return this._setData();
  }
  read(id) {
    return this.backend.getIndexEntry(this.index.name, id);
  }
  write(id, node) {
    return this.backend.setIndexEntry(this.index.name, id, node);
  }
  remove(id) {
    return this.backend.setIndexEntry(this.index.name, id, undefined);
  }
  async allocate(node) {
    let id = this.index.nodes;
    this.index.nodes = id + 1;
    await this._setData();
    return id;
  }
  // Put index directly into the B+Tree.
  readData(id) {
    return Promise.resolve(id);
  }
  writeData(id, index) {
    return Promise.resolve(index);
  }
  removeData(id) {
    return Promise.resolve();
  }
  allocateData(index) {
    return Promise.resolve(index);
  }
}
