import 'core-js/modules/es7.symbol.async-iterator';
import Database from './database';

describe('database', () => {
  let database;
  beforeEach(async() => {
    // Prepopulate with some data
    database = new Database();
    // Currently the database doesn't support object hierarchy.
    await database.add([{
      id: 3,
      title: 'hello world',
      score: 5,
    }, {
      id: 1,
      title: 'what',
      score: 20,
    }]);
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
  describe('#explain', () => {
    /*
    it('should return appropriate results', async() => {
      await database.addIndex(['title']);
      expect(await database.explain({})).toEqual([{
        index: { id: 0, keys: ['id'] },
        type: 'range',
        lowEqual: true,
        highEqual: true,
        low: undefined,
        high: undefined,
      }]);
      expect(await database.explain({ where: { id: 3 } })).toEqual([{
        index: { id: 0, keys: ['id'] },
        type: 'match',
        values: [3],
      }]);
      expect(await database.explain({ order: [['id', 1]] })).toEqual([{
        index: { id: 0, keys: ['id'] },
        type: 'range',
        lowEqual: true,
        highEqual: true,
        low: undefined,
        high: undefined,
      }]);
      expect(await database.explain({ order: [['id', -1]] })).toEqual([{
        index: { id: 0, keys: ['id'] },
        type: 'range',
        reverse: true,
        lowEqual: true,
        highEqual: true,
        low: undefined,
        high: undefined,
      }]);
      expect(await database.explain({ order: [['title', -1]] })).toEqual([{
        index: { id: 1, keys: ['title', 'id'] },
        reverse: true,
        lowEqual: true,
        highEqual: true,
        low: undefined,
        high: undefined,
      }]);
    });
    */
  });
});
