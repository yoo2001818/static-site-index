export default class TreeAdapter {
  constructor(index, data) {
    this.index = index;
    this.backend = index.backend;
    this.data = data;
  }
  _setData() {
    // The manifest object is required to have `this.data`. If that's ensured,
    // we can simply call 'setManifest' and we're good to go.
    // TODO Is this really safe? I'd use immutable data structure...
    return this.index.setManifest(this.index.manifest);
  }
  getRoot() {
    return Promise.resolve(this.data.root);
  }
  writeRoot(id) {
    this.data.root = id;
    return this._setData();
  }
  read(id) {
    return this.backend.getIndexEntry(this.data.name, id);
  }
  write(id, node) {
    return this.backend.setIndexEntry(this.data.name, id, node);
  }
  remove(id) {
    return this.backend.setIndexEntry(this.data.name, id, undefined);
  }
  async allocate(node) {
    let id = this.data.nodes;
    this.data.nodes = id + 1;
    await this._setData();
    return id;
  }
  // Put data directly into the B+Tree.
  readData(id) {
    return Promise.resolve(id);
  }
  writeData(id, data) {
    return Promise.resolve(data);
  }
  removeData(id) {
    return Promise.resolve();
  }
  allocateData(data) {
    return Promise.resolve(data);
  }
}
