export default class TreeAdapter {
  constructor(index, metadata) {
    this.index = index;
    this.backend = index.backend;
    let { name } = meatdata;
    this.name = name;
  }
  _getData() {
    // This is supposed to be synchronous since the whole manifest data is
    // loaded before creating this object.
    return this.index.manifest.indexData[this.name] || {
      root: null,
      nodes: 0,
    };
  }
  _setData(data) {
    // Notify update to manifest. We don't have to be immutable - we can just
    // mutate the object and just call the set method.
    this.index.manifest.indexData[this.name] = data;
    return this.index.setManifest(this.index.manifest);
  }
  getRoot() {
    return Promise.resolve(this._getData().root);
  }
  writeRoot(id) {
    // This is weird.
    return this._setData(Object.assign(this._getData(), { root: id }));
  }
  read(id) {
    return this.backend.getIndexEntry(this.name, id);
  }
  write(id, node) {
    return this.backend.setIndexEntry(this.name, id, node);
  }
  remove(id) {
    return this.backend.setIndexEntry(this.name, id, undefined);
  }
  async allocate(node) {
    let id = this._getData().nodes;
    await this._setData(Object.assign(this._getData(), { nodes: id + 1 }));
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
