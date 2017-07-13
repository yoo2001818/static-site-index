export default class TreeAdapter {
  constructor(backend, index, setIndex) {
    this.backend = backend;
    this.setIndex = setIndex;
    let { name, root } = index;
    this.root = root;
    this.name = name;
  }
  getRoot() {
    return this.root;
  }
  writeRoot(id) {
    return this.setIndex({ name: this.name, root: id });
  }
}
