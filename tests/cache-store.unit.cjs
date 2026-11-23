const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function createStore(limit = Infinity) {
  let raw = null;
  const localStorage = {
    getItem() { return raw; },
    setItem(key, value) {
      if (value.length * 2 > limit) {
        const error = new Error('quota');
        error.name = 'QuotaExceededError';
        throw error;
      }
      raw = value;
    },
  };
  const source = fs.readFileSync(require.resolve('../app.js'), 'utf8');
  const start = source.indexOf('  class CacheStore {');
  const end = source.indexOf('\n  class ', start + 1);
  const CacheStore = vm.runInNewContext(source.slice(start, end) + '\nCacheStore', {
    window: { localStorage }, console: { warn() {} },
  });
  return { cache: new CacheStore({ cacheStorageKey: 'cache' }), localStorage };
}

const row = { kingdomId: 1414, rank: 42, num: 9, status: 1 };

test('retains 71 powers with 2043 kingdoms under a 5 MiB UTF-16 budget and restores every field', () => {
  const { cache, localStorage } = createStore(5 * 1024 * 1024);
  const items = {};
  for (let power = 1000; power <= 8000; power += 100) {
    items[power] = {
      requestedAt: new Date().toISOString(), requestPlan: { power },
      kingdomList: Array.from({ length: 2043 }, (_, i) => ({
        kingdomId: i + 1, rank: (i * 17 + power) % 10000, num: 90, status: i % 5,
        searchText: 'derived search text that does not need storage',
      })),
    };
  }
  assert.equal(cache.writeStore({ items }, '8000'), true);
  const restored = JSON.parse(JSON.stringify(cache.readStore()));
  assert.equal(Object.keys(restored.items).length, 71);
  assert.deepEqual(restored.items[1000].kingdomList[1413], {
    kingdomId: 1414, rank: (1413 * 17 + 1000) % 10000, num: 90, status: 1413 % 5,
  });
  assert.equal(items[1000].kingdomList[0].searchText.startsWith('derived'), true);
  assert.ok(localStorage.getItem().length * 2 < 5 * 1024 * 1024);
});

test('reads legacy object rows and preserves quota fallback with newest power protected', () => {
  const { cache, localStorage } = createStore();
  localStorage.setItem('cache', JSON.stringify({ items: { 1000: { kingdomList: [row] } } }));
  assert.deepEqual(JSON.parse(JSON.stringify(cache.readStore().items[1000].kingdomList)), [row]);
  const small = createStore(500);
  const items = {
    1000: { requestedAt: '2026-01-01', kingdomList: Array.from({length: 10}, () => row) },
    8000: { requestedAt: '2026-11-23', kingdomList: [row] },
  };
  assert.equal(small.cache.writeStore({items}, '8000'), true);
  assert.deepEqual(Object.keys(small.cache.readStore().items), ['8000']);
});

test('backfills weighted average metadata without altering source rows or timestamps, and reuses valid aggregates', () => {
  const { cache, localStorage } = createStore();
  const items = {};
  for (const [power, ranks] of [[1000, [10, 8, 1]], [1100, [12, 8, 4]], [1200, [18, 8, 0]]]) {
    items[power] = { requestedAt: '2026-11-23T00:00:00Z', requestPlan: {power},
      kingdomRowFormat: 'tuple-v1', kingdomList: ranks.map((rank, i) => [1266 + i, rank, 90, 1]) };
  }
  localStorage.setItem('cache', JSON.stringify({ items, extra: 'keep' }));
  const result = cache.getAverage([1000, 1200]);
  assert.equal(result.values[1266], 1125); // (2*1050 + 6*1150)/8
  assert.equal(result.values[1267], null); // No observed players, not an average of zero power.
  assert.equal(result.values[1268], 1050); // The rank-zero band is excluded.
  const stored = JSON.parse(localStorage.getItem());
  assert.deepEqual(stored.items, items);
  assert.equal(stored.extra, 'keep');
  assert.equal(stored.average.ranges['1000-1200'].values[1266], 1125);
  const raw = localStorage.getItem();
  cache.getAverage([1000, 1200]);
  assert.equal(localStorage.getItem(), raw);
  const changed = JSON.parse(raw);
  changed.items[1100].kingdomList[0][1] = 16;
  localStorage.setItem('cache', JSON.stringify(changed));
  assert.equal(cache.getAverage([1000, 1200]).values[1266], 1075);
});

test('a full quota can skip average persistence without evicting any source cache', () => {
  const items = {1000: {kingdomList: [row]}, 1100: {kingdomList: [{...row, rank: 43}]}};
  const raw = JSON.stringify({items});
  const {cache, localStorage} = createStore(raw.length * 2);
  localStorage.setItem('cache', raw);
  assert.equal(cache.getAverage([1000, 1100]).values[1414], 1050);
  assert.equal(localStorage.getItem(), raw);
});
