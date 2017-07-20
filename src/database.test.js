import 'core-js/modules/es7.symbol.async-iterator';
import Database from './database';

describe('database', () => {
  let database;
  beforeEach(async() => {
    // Prepopulate with some data
    database = new Database();
    // Currently the database doesn't support object hierarchy.
    await database.add({
      id: 3,
      title: 'hello world',
      score: 5,
    });
  });
  describe('#addIndex', () => {
    it('should add an index', async() => {
      await database.addIndex(['title']);
      expect(database.manifest.indexes).toEqual([
        { id: 0, name: null, keys: ['id'], root: 0, nodes: 1 },
        { id: 1, name: 1, keys: ['title', 'id'], root: 0, nodes: 1 },
      ]);
    });
  });
});
