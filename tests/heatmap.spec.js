const fs = require('node:fs/promises');
const path = require('node:path');
const { test, expect } = require('playwright/test');

const cacheKey = 'lm_migration_cache_store_v1';
const outputDir = path.resolve(__dirname, '../output/heatmap-verification');

function makeStore(ids = [1414, 1266, 1738], bands = 4) {
  const items = {};
  for (let index = 0; index <= bands; index += 1) {
    const power = 1000 + index * 100;
    items[power] = {
      requestedAt: new Date().toISOString(),
      requestPlan: { power, num: 90, status: 0, order: 1, url: '/api/migration', method: 'POST' },
      kingdomList: ids.map((kingdomId, row) => ({
        kingdomId,
        rank: kingdomId === 1414 ? [10, 10, 5, 0, 7][index] ?? 7 :
          kingdomId === 1266 ? [10, 14, 20, 30, 40][index] ?? 40 : 20 + index * (row % 8),
        num: 90, status: 1,
      })),
    };
  }
  return { items };
}

async function openCached(page, { store = makeStore(), ids = '1414,1266,1738', power = '1.0-1.4B' } = {}) {
  await page.route('**/api/migration', (route) => {
    throw new Error('Chart interactions must never call the migration API: ' + route.request().url());
  });
  await page.addInitScript(({ key, store }) => {
    const original = Storage.prototype.setItem;
    original.call(localStorage, key, JSON.stringify(store));
    original.call(localStorage, 'lm_language_v1', 'en');
    original.call(localStorage, 'lm_theme_v1', 'ocean');
    window.__cacheBefore = localStorage.getItem(key);
    window.__cacheWrites = 0;
    window.__averageWrites = 0;
    Storage.prototype.setItem = function (name, value) {
      if (name === key) {
        const before = JSON.parse(window.__cacheBefore);
        const next = JSON.parse(value);
        const { average, ...source } = next;
        if (JSON.stringify(source) !== JSON.stringify(before)) {
          window.__cacheWrites += 1;
          throw new Error('Do not overwrite fetched source cache data');
        }
        window.__averageWrites += 1;
      }
      return original.call(this, name, value);
    };
  }, { key: cacheKey, store });
  await page.goto(`/ranking/${encodeURIComponent(power)}/${ids}`);
  await expect(page.locator('.rank-chart-canvas-wrap')).toHaveCount(ids.split(',').length);
}

async function assertCacheUntouched(page) {
  expect(await page.evaluate((key) => ({ unchanged: JSON.stringify((({ average, ...source }) => source)(JSON.parse(localStorage.getItem(key)))) === window.__cacheBefore,
    writes: window.__cacheWrites }), cacheKey)).toEqual({ unchanged: true, writes: 0 });
}

async function exportFile(page) {
  const pending = page.waitForEvent('download');
  await page.locator('#exportRankChartsImageButton').click();
  const download = await pending;
  const data = await fs.readFile(await download.path());
  await expect(page.locator('#rankChartStatus')).toContainText('Saved the chart image(s).');
  return { name: download.suggestedFilename(), data };
}

function pngSize(data) {
  expect(data.subarray(1, 4).toString()).toBe('PNG');
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
}

async function zipImages(page, data) {
  const result = await page.evaluate(async (bytes) => {
    const zip = await window.JSZip.loadAsync(new Uint8Array(bytes));
    return await Promise.all(Object.values(zip.files).map(async (file) => {
      const bytes = await file.async('uint8array');
      const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      return { name: file.name, width: view.getUint32(16), height: view.getUint32(20) };
    }));
  }, [...data]);
  return result;
}

test('preserves counts and gaps across four tabs, themes, keyboard navigation and locale changes without updating cache', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await openCached(page);
  expect(await page.evaluate(() => Object.values(Chart.instances).map((chart) => chart.data.datasets[0].data)))
    .toEqual([[4, 6, 10, 10], [0, 5, 0, 0], [2, 2, 2, 2]]);
  await page.locator('#rankChartTabHeatmapH').click();
  await expect(page.locator('.rank-heatmap-wrap')).toHaveCount(1);
  expect(await page.locator('canvas table tr').allTextContents()).toEqual([
    'Kingdom ID1.0 B - 1.1 B1.1 B - 1.2 B1.2 B - 1.3 B1.3 B - 1.4 B',
    'K1266461010', 'K141405UnavailableUnavailable', 'K17382222',
  ]);
  const ocean = await page.locator('.rank-heatmap-wrap canvas').evaluate((canvas) => canvas.toDataURL());
  for (const theme of ['ivory', 'forest', 'graphite', 'sunset', 'lavender', 'lagoon', 'rosewood']) {
    await page.locator('#themeSelect').selectOption(theme);
    expect(await page.locator('.rank-heatmap-wrap canvas').evaluate((canvas) => canvas.toDataURL())).not.toBe(ocean);
  }
  await page.locator('#rankChartTabHeatmapH').press('ArrowRight');
  await expect(page.locator('#rankChartTabHeatmapV')).toBeFocused();
  await expect(page.locator('#rankChartTabHeatmapV')).toHaveAttribute('aria-selected', 'true');
  expect(await page.locator('canvas table tr th[scope="row"]').allTextContents()).toEqual(['K1266', 'K1414', 'K1738']);
  await page.locator('#languageSelect').selectOption('ja');
  await expect(page.locator('#rankChartTabHeatmapV')).toHaveText('H縦');
  await expect(page.locator('canvas')).toHaveAttribute('aria-label', /3王国/);
  await page.locator('#rankChartTabHeatmapV').press('Home');
  await expect(page.locator('.rank-chart-canvas-wrap')).toHaveCount(3);
  await page.locator('#rankChartTabLine').click();
  expect(await page.evaluate(() => Object.values(Chart.instances).map((chart) => ({ type: chart.config.type,
    values: chart.data.datasets[0].data, max: chart.options.scales.y.max }))))
    .toEqual([
      { type: 'line', values: [4, 6, 10, 10], max: 11 },
      { type: 'line', values: [0, 5, 0, 0], max: 11 },
      { type: 'line', values: [2, 2, 2, 2], max: 11 },
    ]);
  await assertCacheUntouched(page);
  expect(errors).toEqual([]);
});

test('keeps missing cache and absent kingdoms distinct from genuine zero counts', async ({ page }) => {
  const store = makeStore();
  delete store.items[1200];
  store.items[1000].kingdomList = store.items[1000].kingdomList.filter((row) => row.kingdomId !== 1738);
  await openCached(page, { store });
  await page.locator('#rankChartTabHeatmapH').click();
  const row = page.locator('canvas table tr').filter({ has: page.locator('th[scope="row"]', { hasText: 'K1414' }) });
  expect(await row.locator('td').allTextContents()).toEqual(['0', 'Unavailable', 'Unavailable', 'Unavailable']);
  const absent = page.locator('canvas table tr').filter({ has: page.locator('th[scope="row"]', { hasText: 'K1738' }) });
  expect(await absent.locator('td').allTextContents()).toEqual(['Unavailable', 'Unavailable', 'Unavailable', '2']);
  await assertCacheUntouched(page);
});

for (const type of ['bar', 'line', 'heatmap-h', 'heatmap-v']) {
  test(`exports a real PNG for ${type} with fixed resolution on mobile and desktop`, async ({ page }) => {
    const ids = type.startsWith('heatmap') ? Array.from({ length: 45 }, (_, i) => 1266 + i) : [1266, 1414, 1738, 1805];
    await openCached(page, { store: makeStore(ids, 70), ids: ids.join(','), power: '1.0-8.0B' });
    const tab = page.locator(`[role="tab"][data-chart-type="${type}"]`);
    await tab.click();
    const desktop = await exportFile(page);
    expect(desktop.name).toMatch(new RegExp(`ranking-charts-${type}-.*\\.png$`));
    const size = pngSize(desktop.data);
    expect(size.width).toBe(2880);
    await page.setViewportSize({ width: 390, height: 844 });
    const mobile = await exportFile(page);
    expect(pngSize(mobile.data)).toEqual(size);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    expect(await page.locator('[style*="-100000px"]').count()).toBe(0);
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(path.join(outputDir, `${type}.png`), desktop.data);
    await page.screenshot({ path: path.join(outputDir, `${type}-mobile.png`), fullPage: false });
    await assertCacheUntouched(page);
  });
}

for (const type of ['bar', 'line', 'heatmap-h', 'heatmap-v']) {
  test(`exports all pages as valid PNGs in ZIP for ${type}`, async ({ page }) => {
    const ids = Array.from({ length: type.startsWith('heatmap') ? 46 : 5 }, (_, i) => 1266 + i);
    await openCached(page, { store: makeStore(ids), ids: ids.join(',') });
    await page.locator(`[role="tab"][data-chart-type="${type}"]`).click();
    const output = await exportFile(page);
    expect(output.name).toMatch(/\.zip$/);
    const images = await zipImages(page, output.data);
    expect(images).toHaveLength(type.startsWith('heatmap') ? 2 : 1);
    for (const image of images) {
      expect(image.name).toMatch(/-part-\d{2}\.png$/);
      expect(image.width).toBe(2880);
      expect(image.height).toBeGreaterThan(300);
    }
    await assertCacheUntouched(page);
  });
}

test('displays more than 70 power bands together and only splits the exported images', async ({ page }) => {
  await openCached(page, { store: makeStore([1266, 1414], 71), ids: '1266,1414', power: '1.0-8.1B' });
  await page.locator('#rankChartTabHeatmapH').click();
  await expect(page.locator('.rank-heatmap-wrap')).toHaveCount(1);
  expect(await page.locator('canvas table tr').filter({ has: page.locator('th[scope="col"]') }).evaluateAll((rows) =>
    rows.map((row) => row.children.length - 1))).toEqual([71]);
  const output = await exportFile(page);
  expect(await zipImages(page, output.data)).toHaveLength(2);
  await assertCacheUntouched(page);
});

test('disables selection while exporting and recovers controls after an export failure', async ({ page }) => {
  await openCached(page);
  await page.locator('#rankChartTabHeatmapH').click();
  await page.evaluate(() => {
    window.html2canvas = () => new Promise((resolve, reject) => { window.__rejectExport = reject; });
  });
  await page.locator('#exportRankChartsImageButton').click();
  for (const selector of ['#rankChartTabBar', '#rankChartTabLine', '#rankChartTabHeatmapH', '#rankChartTabHeatmapV',
    '#themeSelect', '#languageSelect', '#refreshRankChartCacheButton', '#rankChartSortSelect',
    '#rankChartPowerMin', '#rankChartPowerMax',
    '#rankChartPowerMinValue', '#rankChartPowerMaxValue',
    '#showKingdomInfoButton', '#showRankDistributionButton',
    '#rankChartKingdomEntryInput', '[data-rank-chart-kingdom="1266"]', '[data-remove-rank-chart-kingdom="1266"]']) {
    await expect(page.locator(selector)).toBeDisabled();
  }
  await page.evaluate(() => window.__rejectExport(new Error('controlled test failure')));
  await expect(page.locator('#rankChartStatus')).toContainText('controlled test failure');
  await expect(page.locator('#rankChartTabBar')).toBeEnabled();
  await expect(page.locator('#themeSelect')).toBeEnabled();
  await expect(page.locator('#exportRankChartsImageButton')).toBeEnabled();
  await expect(page.locator('[data-rank-chart-kingdom="1266"]')).toBeEnabled();
  expect(await page.locator('[style*="-100000px"]').count()).toBe(0);
  await assertCacheUntouched(page);
});

test('returns to search filters and preserves the table PNG export', async ({ page }) => {
  await openCached(page);
  await page.locator('#rankChartTabHeatmapH').click();
  await page.locator('#showKingdomInfoButton').click();
  await expect(page.locator('#rankChartPage')).toBeHidden();
  await expect(page.locator('#resultTable')).toBeVisible();
  await page.locator('#kingdomRangeListInput').fill('1266 1414');
  await expect(page.locator('#resultBody tr')).toHaveCount(2);
  const pending = page.waitForEvent('download');
  await page.locator('#exportTableImageButton').click();
  const download = await pending;
  expect(download.suggestedFilename()).toMatch(/^migration-table-.*\.png$/);
  expect(pngSize(await fs.readFile(await download.path())).width).toBe(2360);
  await page.locator('#openRankChartButton').click();
  await expect(page.locator('#rankChartKingdomInput')).toHaveValue('1266,1414');
  await expect(page.locator('#rankChartTabHeatmapH')).toHaveAttribute('aria-selected', 'true');
  await assertCacheUntouched(page);
});

test('loads the local renderer when index.html is opened directly without a server', async ({ page }) => {
  await page.goto(require('node:url').pathToFileURL(path.resolve(__dirname, '../index.html')).href);
  await expect(page.locator('#fetchButton')).toBeVisible();
  await expect.poll(() => page.evaluate(() => typeof window.MigrationHeatmap)).toBe('function');
  expect(await page.locator('#rankChartTabs [role="tab"]').count()).toBe(4);
  expect(await page.locator('script[src="./heatmap.js"]').count()).toBe(1);
});

test('sort list applies all six orders to all four graphs and exported PNGs without touching source data', async ({ page }) => {
  await openCached(page);
  await expect(page.locator('#rankChartSortControl')).toBeVisible();
  await page.evaluate(() => {
    const capture = window.html2canvas;
    window.__sortExportOrders = [];
    window.html2canvas = async (element, options) => {
      const rows = [...element.querySelectorAll('canvas table th[scope="row"]')];
      window.__sortExportOrders.push(rows.length ? rows.map((th) => th.textContent) :
        [...element.querySelectorAll('canvas')].map((canvas) => Chart.getChart(canvas).options.plugins.title.text.match(/K\d+$/)[0]));
      return capture(element, options);
    };
  });
  const orders = {
    'kingdom-asc': ['K1266', 'K1414', 'K1738'],
    'kingdom-desc': ['K1738', 'K1414', 'K1266'],
    'total-desc': ['K1266', 'K1738', 'K1414'],
    'total-asc': ['K1414', 'K1738', 'K1266'],
    'average-desc': ['K1266', 'K1738', 'K1414'],
    'average-asc': ['K1414', 'K1738', 'K1266'],
  };
  for (const type of ['bar', 'line', 'heatmap-h', 'heatmap-v']) {
    await page.locator(`[role="tab"][data-chart-type="${type}"]`).click();
    const select = page.getByRole('combobox', { name: 'Sort by', exact: true });
    await expect(select).toBeVisible();
    expect(await select.locator('option').count()).toBe(6);
    for (const [sort, order] of Object.entries(orders)) {
      await select.selectOption(sort);
      const displayed = type.startsWith('heatmap') ? await page.locator('canvas table th[scope="row"]').allTextContents() :
        await page.locator('.rank-chart-canvas-list canvas').evaluateAll((canvases) =>
          canvases.map((canvas) => Chart.getChart(canvas).options.plugins.title.text.match(/K\d+$/)[0]));
      expect(displayed).toEqual(order);
      await expect(page.locator('#rankChartKingdomInput')).toHaveValue('1414,1266,1738');
      const output = await exportFile(page);
      expect(pngSize(output.data).width).toBe(2880);
      expect(await page.evaluate(() => window.__sortExportOrders.at(-1))).toEqual(order);
    }
  }
  await page.locator('#themeSelect').selectOption('forest');
  await page.locator('#languageSelect').selectOption('ja');
  await expect(page.getByRole('combobox', { name: '並び順', exact: true })).toHaveValue('average-asc');
  expect(await page.locator('canvas table th[scope="row"]').allTextContents()).toEqual(orders['average-asc']);
  await assertCacheUntouched(page);
});

test('keeps the selected sort across heatmap ZIP page boundaries', async ({ page }) => {
  const ids = Array.from({ length: 46 }, (_, i) => 1266 + i);
  await openCached(page, { store: makeStore(ids), ids: ids.join(',') });
  await page.locator('#rankChartTabHeatmapH').click();
  await page.locator('#rankChartSortSelect').selectOption('kingdom-desc');
  await expect(page.locator('.rank-heatmap-wrap')).toHaveCount(1);
  const expected = [...ids].reverse().map((id) => `K${id}`);
  expect(await page.locator('canvas table th[scope="row"]').allTextContents()).toEqual(expected);
  await page.evaluate(() => {
    const capture = window.html2canvas;
    window.__sortExportOrders = [];
    window.html2canvas = async (element, options) => {
      window.__sortExportOrders.push([...element.querySelectorAll('canvas table th[scope="row"]')].map((th) => th.textContent));
      return capture(element, options);
    };
  });
  const output = await exportFile(page);
  expect(await zipImages(page, output.data)).toHaveLength(2);
  expect(await page.evaluate(() => window.__sortExportOrders.flat())).toEqual(expected);
  await assertCacheUntouched(page);
});

for (const type of ['bar', 'line']) {
  test(`keeps ${type} sort order across five-kingdom ZIP page boundaries`, async ({ page }) => {
    const ids = [1414, 1266, 1738, 1805, 1001, 1600];
    await openCached(page, { store: makeStore(ids), ids: ids.join(',') });
    await page.locator(`[role="tab"][data-chart-type="${type}"]`).click();
    await page.locator('#rankChartSortSelect').selectOption('kingdom-desc');
    await page.evaluate(() => {
      const capture = window.html2canvas;
      window.__sortExportOrders = [];
      window.html2canvas = async (element, options) => {
        window.__sortExportOrders.push([...element.querySelectorAll('canvas')].map((canvas) =>
          Chart.getChart(canvas).options.plugins.title.text.match(/K\d+$/)[0]));
        return capture(element, options);
      };
    });
    const output = await exportFile(page);
    expect(await zipImages(page, output.data)).toHaveLength(2);
    const expected = [...ids].sort((a, b) => b - a).map((id) => `K${id}`);
    expect(await page.evaluate(() => window.__sortExportOrders)).toEqual([expected.slice(0, 5), expected.slice(5)]);
    await assertCacheUntouched(page);
  });
}

test('shows 1-10B in one heatmap for both orientations while preserving all bands and export pages', async ({ page }) => {
  const ids = Array.from({ length: 45 }, (_, i) => 1266 + i);
  await openCached(page, { store: makeStore(ids, 90), ids: ids.join(','), power: '1.0-10.0B' });
  for (const type of ['heatmap-h', 'heatmap-v']) {
    await page.locator(`[role="tab"][data-chart-type="${type}"]`).click();
    await expect(page.locator('.rank-heatmap-wrap')).toHaveCount(1);
    await expect(page.locator('.rank-heatmap-wrap canvas')).toHaveCount(1);
    expect(await page.locator('canvas table th[scope="row"]').count()).toBe(45);
    expect(await page.locator('canvas table th[scope="col"]').count()).toBe(91);
    expect(await page.locator('canvas table th[scope="col"]').last().textContent()).toBe('9.9 B - 10.0 B');
    const output = await exportFile(page);
    expect(await zipImages(page, output.data)).toHaveLength(2);
  }
  await assertCacheUntouched(page);
});

for (const type of ['bar', 'line', 'heatmap-h', 'heatmap-v']) {
  test(`restores ${type} and all six sort selections from the URL after reload`, async ({ page }) => {
    await openCached(page);
    const historyLength = await page.evaluate(() => history.length);
    await page.locator(`[role="tab"][data-chart-type="${type}"]`).click();
    for (const sort of ['kingdom-asc', 'kingdom-desc', 'total-desc', 'total-asc', 'average-desc', 'average-asc']) {
      await page.locator('#rankChartSortSelect').selectOption(sort);
      const url = new URL(page.url());
      expect(url.searchParams.get('tab')).toBe(type);
      expect(url.searchParams.get('sort')).toBe(sort);
      expect(await page.evaluate(() => history.length)).toBe(historyLength);
      await page.reload();
      await expect(page.locator(`[role="tab"][data-chart-type="${type}"]`)).toHaveAttribute('aria-selected', 'true');
      await expect(page.locator('#rankChartSortSelect')).toHaveValue(sort);
      if (type.startsWith('heatmap')) {
        await expect(page.locator('.rank-heatmap-wrap')).toHaveCount(1);
      } else {
        await expect(page.locator('.rank-chart-canvas-wrap')).toHaveCount(3);
        expect(await page.evaluate(() => Object.values(Chart.instances).map((chart) => chart.config.type)))
          .toEqual([type, type, type]);
        const expected = {
          'kingdom-asc': ['K1266', 'K1414', 'K1738'],
          'kingdom-desc': ['K1738', 'K1414', 'K1266'],
          'total-desc': ['K1266', 'K1738', 'K1414'],
          'total-asc': ['K1414', 'K1738', 'K1266'],
          'average-desc': ['K1266', 'K1738', 'K1414'],
          'average-asc': ['K1414', 'K1738', 'K1266'],
        };
        expect(await page.locator('#rankChartCanvasList canvas').evaluateAll((canvases) =>
          canvases.map((canvas) => Chart.getChart(canvas).options.plugins.title.text.match(/K\d+$/)[0])))
          .toEqual(expected[sort]);
      }
      await assertCacheUntouched(page);
    }
  });
}

test('reads legacy query selections and preserves tab, sort, unrelated query values and hash after changing inputs', async ({ page }) => {
  await openCached(page);
  await page.goto('/ranking?powers=1000,1100&kingdoms=1266,1414&tab=heatmap-v&sort=total-desc&keep=yes#selected');
  await expect(page.locator('#rankChartTabHeatmapV')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#rankChartSortSelect')).toHaveValue('total-desc');
  await page.locator('#rankChartPowerMax').press('End');
  for (const id of [1266, 1414]) await page.locator(`[data-remove-rank-chart-kingdom="${id}"]`).click();
  await page.locator('#rankChartKingdomEntryInput').fill('1738 1266');
  await page.locator('#rankChartKingdomEntryInput').press('Enter');
  const url = new URL(page.url());
  expect(url.searchParams.get('keep')).toBe('yes');
  expect(url.hash).toBe('#selected');
  expect(url.searchParams.has('powers')).toBe(false);
  expect(url.searchParams.has('kingdoms')).toBe(false);
  await page.reload();
  await expect(page.locator('#rankChartPowerRangeInput')).toHaveValue('1.0B-1.4B');
  await expect(page.locator('#rankChartKingdomInput')).toHaveValue('1738,1266');
  await expect(page.locator('#rankChartTabHeatmapV')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#rankChartSortSelect')).toHaveValue('total-desc');
  await assertCacheUntouched(page);
});

test('normalizes missing or unknown URL tab and sort to safe defaults even without chart data', async ({ page }) => {
  await openCached(page);
  for (const suffix of ['', '?tab=unknown&sort=unknown']) {
    await page.goto('/ranking' + suffix);
    await expect(page.locator('#rankChartTabBar')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#rankChartSortSelect')).toHaveValue('kingdom-asc');
    const url = new URL(page.url());
    expect(url.searchParams.get('tab')).toBe('bar');
    expect(url.searchParams.get('sort')).toBe('kingdom-asc');
  }
  await assertCacheUntouched(page);
});

test('kingdom tags filter all four charts and PNG exports and persist visibility in the URL', async ({ page }) => {
  await openCached(page);
  await page.goto('/ranking/1-1.4b/1414,1266,1738?tab=bar&sort=kingdom-asc&keep=yes#selection');
  const historyLength = await page.evaluate(() => history.length);
  await page.locator('[data-rank-chart-kingdom="1266"]').click();
  await expect(page.locator('[data-rank-chart-kingdom="1266"]')).toHaveAttribute('aria-pressed', 'false');
  expect(new URL(page.url()).searchParams.get('kingdom')).toBe('1414,!1266,1738');
  await page.evaluate(() => {
    const capture = window.html2canvas;
    window.__visibleExportIds = [];
    window.html2canvas = async (element, options) => {
      const ids = [...element.querySelectorAll('canvas')].flatMap((canvas) => {
        const rows = [...canvas.querySelectorAll('th[scope="row"]')];
        if (rows.length) return rows.map((row) => Number(row.textContent.slice(1)));
        return [Number(String(Chart.getChart(canvas).options.plugins.title.text).match(/K(\d+)$/)[1])];
      });
      window.__visibleExportIds.push(ids);
      return capture(element, options);
    };
  });
  for (const type of ['bar', 'line', 'heatmap-h', 'heatmap-v']) {
    await page.locator(`[role="tab"][data-chart-type="${type}"]`).click();
    if (type.startsWith('heatmap')) {
      expect(await page.locator('canvas table th[scope="row"]').allTextContents()).toEqual(['K1414', 'K1738']);
    } else {
      await expect(page.locator('.rank-chart-canvas-wrap')).toHaveCount(2);
    }
    expect(pngSize((await exportFile(page)).data).width).toBe(2880);
    expect(await page.evaluate(() => window.__visibleExportIds.at(-1))).toEqual([1414, 1738]);
    await expect(page.locator('[data-rank-chart-kingdom="1266"]')).toBeVisible();
  }
  await page.locator('#rankChartSortSelect').selectOption('total-desc');
  await page.locator('#themeSelect').selectOption('forest');
  await page.locator('#languageSelect').selectOption('fr');
  await expect(page.locator('[data-rank-chart-kingdom="1266"]')).toHaveAttribute('aria-pressed', 'false');
  await page.reload();
  await expect(page.locator('[data-rank-chart-kingdom="1266"]')).toHaveAttribute('aria-pressed', 'false');
  expect(new URL(page.url()).searchParams.get('keep')).toBe('yes');
  expect(new URL(page.url()).hash).toBe('#selection');
  expect(await page.evaluate(() => history.length)).toBe(historyLength);
  await page.locator('[data-rank-chart-kingdom="1266"]').press('Space');
  await expect(page.locator('[data-rank-chart-kingdom="1266"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-rank-chart-kingdom="1266"]')).toBeFocused();
  await expect(page.locator('canvas table th[scope="row"]')).toHaveCount(3);
  await assertCacheUntouched(page);
});

test('kingdom tags restore all-hidden and legacy query notation and can show a kingdom again', async ({ page }) => {
  await openCached(page);
  await page.goto('/ranking/1-1.4b/!1414,!1266,!1738?tab=heatmap-h&sort=average-desc');
  await expect(page.locator('[data-rank-chart-kingdom]')).toHaveCount(3);
  await expect(page.locator('#rankChartCanvasList > *')).toHaveCount(0);
  await expect(page.locator('#exportRankChartsImageButton')).toBeDisabled();
  await page.locator('#themeSelect').selectOption('rosewood');
  await page.locator('#languageSelect').selectOption('fr');
  await expect(page.locator('#rankChartStatus')).toBeHidden();
  await page.locator('#rankChartTabHeatmapV').click();
  await page.locator('#rankChartSortSelect').selectOption('total-asc');
  await page.reload();
  await expect(page.locator('#rankChartCanvasList > *')).toHaveCount(0);
  await page.locator('[data-rank-chart-kingdom="1414"]').click();
  expect(await page.locator('canvas table th[scope="row"]').allTextContents()).toEqual(['K1414']);
  await expect(page.locator('#exportRankChartsImageButton')).toBeEnabled();
  await page.goto('/ranking?power=1-1.4b&kingdom=!1266,1414&tab=heatmap-h&sort=kingdom-desc&keep=yes#k');
  await expect(page.locator('#rankChartKingdomInput')).toHaveValue('!1266,1414');
  await expect(page.locator('[data-rank-chart-kingdom="1266"]')).toHaveAttribute('aria-pressed', 'false');
  expect(await page.locator('canvas table th[scope="row"]').allTextContents()).toEqual(['K1414']);
  expect(new URL(page.url()).searchParams.get('kingdom')).toBe('!1266,1414');
  await page.reload();
  await expect(page.locator('[data-rank-chart-kingdom="1266"]')).toHaveAttribute('aria-pressed', 'false');
  await assertCacheUntouched(page);
});

test('kingdom tags accept multiple additions, deduplicate, delete, validate, and recover after removing every tag', async ({ page }) => {
  await openCached(page);
  const entry = page.locator('#rankChartKingdomEntryInput');
  await entry.fill('1738 1266 !1805');
  await entry.press('Enter');
  await expect(page.locator('[data-rank-chart-kingdom]')).toHaveCount(4);
  await expect(page.locator('#rankChartKingdomInput')).toHaveValue('1414,1266,1738,!1805');
  await expect(entry).toHaveValue('');
  await expect(page.locator('[data-rank-chart-kingdom="1805"]')).toHaveAttribute('aria-pressed', 'false');
  await entry.fill('2040,2041');
  await entry.press('Tab');
  await expect(page.locator('[data-rank-chart-kingdom]')).toHaveCount(6);
  await page.locator('[data-remove-rank-chart-kingdom="1414"]').click();
  await expect(page.locator('[data-rank-chart-kingdom="1414"]')).toHaveCount(0);
  await entry.press('Backspace');
  await expect(page.locator('[data-rank-chart-kingdom="2041"]')).toHaveCount(0);
  const previous = page.url();
  await entry.fill('!oops');
  await entry.press('Enter');
  await expect(entry).toHaveAttribute('aria-invalid', 'true');
  expect(page.url()).toBe(previous);
  await entry.fill('');
  while (await page.locator('[data-remove-rank-chart-kingdom]').count()) {
    await page.locator('[data-remove-rank-chart-kingdom]').first().click();
  }
  await expect(page.locator('#rankChartCanvasList > *')).toHaveCount(0);
  await expect(page.locator('#exportRankChartsImageButton')).toBeDisabled();
  await entry.fill('1266 !1414');
  await entry.press('Enter');
  await expect(page.locator('#rankChartKingdomInput')).toHaveValue('1266,!1414');
  await expect(page.locator('.rank-chart-canvas-wrap')).toHaveCount(1);
  await expect(entry).not.toHaveAttribute('aria-invalid', 'true');
  await assertCacheUntouched(page);
});

test('kingdom tag text stays black or white with readable contrast for every theme and background state', async ({ page }) => {
  await openCached(page);
  await page.locator('[data-rank-chart-kingdom="1414"]').click();
  const tagButtons = page.locator('.rank-chart-kingdom-tag button');
  for (const theme of ['ocean', 'ivory', 'forest', 'graphite', 'sunset', 'lavender', 'lagoon', 'rosewood']) {
    await page.locator('#themeSelect').selectOption(theme);
    const samples = await tagButtons.evaluateAll((buttons) => buttons.map((button) => ({
      text: getComputedStyle(button).color,
      background: getComputedStyle(button.closest('.rank-chart-kingdom-tag')).backgroundColor,
    })));
    for (const sample of samples) {
      expect(['rgb(0, 0, 0)', 'rgb(255, 255, 255)']).toContain(sample.text);
      const rgb = sample.background.match(/[\d.]+/g).slice(0, 3).map(Number);
      const linear = rgb.map((v) => v / 255 <= 0.04045 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4);
      const l = linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
      const ratio = sample.text === 'rgb(0, 0, 0)' ? (l + 0.05) / 0.05 : 1.05 / (l + 0.05);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    }
  }
  await page.evaluate(() => {
    document.documentElement.style.setProperty('--bulma-primary-soft', '#a51024');
    document.documentElement.style.setProperty('--surface-2', '#202020');
  });
  await page.locator('#themeSelect').selectOption('ocean');
  for (const button of await tagButtons.all()) await expect(button).toHaveCSS('color', 'rgb(255, 255, 255)');
  await page.evaluate(() => {
    document.documentElement.style.setProperty('--bulma-primary-soft', '#ffe9ed');
    document.documentElement.style.setProperty('--surface-2', '#ffffff');
  });
  await page.locator('#themeSelect').selectOption('rosewood');
  for (const button of await tagButtons.all()) await expect(button).toHaveCSS('color', 'rgb(0, 0, 0)');
  await assertCacheUntouched(page);
});

test('kingdom tags stay in one 40px input row with 45 kingdoms on desktop and mobile', async ({ page }) => {
  const ids = Array.from({ length: 45 }, (_, i) => 1266 + i);
  await openCached(page, { store: makeStore(ids), ids: ids.join(',') });
  await page.locator('#rankChartTabHeatmapH').click();
  await fs.mkdir(outputDir, { recursive: true });
  for (const width of [1440, 1201, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const metrics = await page.evaluate(() => {
      const field = document.querySelector('#rankChartKingdomField');
      const tags = [...document.querySelectorAll('.rank-chart-kingdom-tag')].map((tag) => tag.getBoundingClientRect());
      return {
        height: field.getBoundingClientRect().height,
        tagHeight: tags[0].height,
        oneRow: tags.every((tag) => tag.top === tags[0].top),
        scrollsInside: field.scrollWidth > field.clientWidth,
        noOverflow: document.documentElement.scrollWidth <= innerWidth + 1,
        controlsAbove: document.querySelector('.rank-chart-controls').getBoundingClientRect().bottom <=
          document.querySelector('#rankChartCanvasList').getBoundingClientRect().top,
      };
    });
    expect(metrics).toEqual({ height: 40, tagHeight: 20, oneRow: true, scrollsInside: true, noOverflow: true, controlsAbove: true });
    await page.screenshot({ path: path.join(outputDir, `kingdom-tags-${width}.png`) });
  }
  await assertCacheUntouched(page);
});

for (const [type, count, hide] of [['bar', 6, 2], ['heatmap-h', 46, 1]]) {
  test(`kingdom tags use only visible kingdoms when choosing PNG or ZIP for ${type}`, async ({ page }) => {
    const ids = Array.from({ length: count }, (_, i) => 1266 + i);
    await openCached(page, { store: makeStore(ids), ids: ids.join(',') });
    await page.locator(`[role="tab"][data-chart-type="${type}"]`).click();
    for (const id of ids.slice(0, hide)) await page.locator(`[data-rank-chart-kingdom="${id}"]`).click();
    const output = await exportFile(page);
    expect(output.name).toMatch(/\.png$/);
    expect(pngSize(output.data).width).toBe(2880);
    await expect(page.locator('[data-rank-chart-kingdom]')).toHaveCount(count);
    await assertCacheUntouched(page);
  });
}

test('power selection bar uses cached bounds and logarithmic spacing and updates graphs without a render button', async ({ page }) => {
  const original = makeStore([1266, 1738], 79);
  const store = { items: Object.fromEntries(Object.entries(original.items).map(([key, value]) => {
    const power = Number(key) - 900;
    return [power, { ...value, requestPlan: { ...value.requestPlan, power } }];
  })) };
  await openCached(page, { store, ids: '1266,1738', power: '100M-8B' });
  await expect(page.locator('#renderRankChartButton')).toHaveCount(0);
  await expect(page.locator('#rankChartStatus')).toBeHidden();
  const min = page.locator('#rankChartPowerMin');
  const max = page.locator('#rankChartPowerMax');
  await expect(min).toHaveAttribute('aria-valuenow', '100');
  await expect(max).toHaveAttribute('aria-valuenow', '8000');
  await expect(min).toHaveAttribute('aria-valuemin', '100');
  await expect(max).toHaveAttribute('aria-valuemax', '8000');
  await max.press('Home');
  for (let i = 0; i < 8; i++) await max.press('ArrowRight');
  await expect(max).toHaveAttribute('aria-valuenow', '1000');
  expect(Number(await max.inputValue())).toBeGreaterThan(5000);
  expect(await page.evaluate(() => Object.values(Chart.instances)[0].data.datasets[0].data.length)).toBe(9);
  await min.press('ArrowRight');
  await expect(min).toHaveAttribute('aria-valuenow', '200');
  expect(new URL(page.url()).pathname).toBe('/ranking');
  expect(new URL(page.url()).searchParams.get('power')).toBe('200M-1.0B');
  expect(new URL(page.url()).searchParams.get('kingdom')).toBe('1266,1738');
  expect(page.url()).not.toMatch(/%2c/i);
  await min.press('End');
  await expect(min).toHaveAttribute('aria-valuenow', '900');
  await max.press('Home');
  await expect(max).toHaveAttribute('aria-valuenow', '1000');
  await page.locator('#rankChartKingdomEntryInput').fill('1414');
  await expect(page.locator('.rank-chart-canvas-wrap')).toHaveCount(3);
  await expect(page.locator('#rankChartKingdomEntryInput')).toHaveValue('1414');
  await expect(page.locator('[data-rank-chart-kingdom="1414"]')).toHaveCount(0);
  await page.locator('#rankChartKingdomEntryInput').press('Enter');
  await expect(page.locator('[data-rank-chart-kingdom="1414"]')).toHaveCount(1);
  await page.reload();
  await expect(min).toHaveAttribute('aria-valuenow', '900');
  await expect(max).toHaveAttribute('aria-valuenow', '1000');
  await assertCacheUntouched(page);
});

test('cache settings open as a small floating gear menu and close without moving the chart or fetching', async ({ page }) => {
  await openCached(page);
  await page.locator('#rankChartTabHeatmapH').click();
  await expect(page.locator('#rankChartPowerList')).toBeHidden();
  const before = await page.locator('#rankChartCanvasList').boundingBox();
  const summary = page.locator('#rankChartCacheOptionsSummary');
  expect((await summary.boundingBox()).width).toBe(32);
  await summary.click();
  await expect(page.locator('#rankChartPowerList')).toBeVisible();
  await expect(page.locator('#refreshRankChartCacheButton')).toBeVisible();
  expect(await page.locator('#rankChartCanvasList').boundingBox()).toEqual(before);
  await page.locator('#rankChartPowerList').press('Escape');
  await expect(page.locator('#rankChartPowerList')).toBeHidden();
  await expect(summary).toBeFocused();
  await summary.click();
  await page.locator('#rankChartPowerRangeLabel').click();
  await expect(page.locator('#rankChartPowerList')).toBeHidden();
  await assertCacheUntouched(page);
});

test('top menu switches views, restores the ranking selection, and canonicalizes legacy encoded commas', async ({ page }) => {
  await openCached(page);
  await page.locator('#languageSelect').selectOption('ja');
  await expect(page.locator('.header-left h1')).toHaveText('Lordsmobile 移民ツール');
  await page.goto('/ranking/1.0B%2C1.4B/1266%2C1414%2C1738?tab=heatmap-h&sort=total-desc&keep=yes#k');
  await expect(page.locator('#showRankDistributionButton')).toHaveAttribute('aria-current', 'page');
  expect(page.url()).not.toMatch(/%2c/i);
  await page.locator('[data-rank-chart-kingdom="1414"]').click();
  const selected = page.url();
  await page.locator('#showKingdomInfoButton').click();
  await expect(page.locator('#searchContent')).toBeVisible();
  await expect(page.locator('#showKingdomInfoButton')).toHaveAttribute('aria-current', 'page');
  await page.locator('#showRankDistributionButton').click();
  await expect(page.locator('#rankChartPage')).toBeVisible();
  expect(page.url()).toBe(selected);
  await expect(page.locator('[data-rank-chart-kingdom="1414"]')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#rankChartSortSelect')).toHaveValue('total-desc');
  await page.goBack();
  await expect(page.locator('#showKingdomInfoButton')).toHaveAttribute('aria-current', 'page');
  await page.goForward();
  await expect(page.locator('#showRankDistributionButton')).toHaveAttribute('aria-current', 'page');
  await assertCacheUntouched(page);
});

test('direct bounds and the range slider stay synchronized while the toolbar and wide chart use the available space', async ({ page }) => {
  const store = makeStore([1266, 1414, 1475, 1530, 1738], 70);
  await openCached(page, { store, ids: '1266,1414,1475,1530,1738', power: '1.0-8.0B' });
  await page.locator('#rankChartTabHeatmapH').click();
  await page.locator('#themeSelect').selectOption('rosewood');
  await page.locator('#languageSelect').selectOption('ja');
  await page.locator('#rankChartSortSelect').selectOption('average-desc');
  await page.locator('#rankChartPowerMaxValue').fill('2.0B');
  await expect(page.locator('#rankChartPowerMax')).toHaveAttribute('aria-valuenow', '2000');
  await page.locator('#rankChartPowerMaxValue').press('Enter');
  await page.locator('#rankChartPowerMinValue').fill('1.2B');
  await page.locator('#rankChartPowerMinValue').press('Enter');
  await expect(page.locator('#rankChartPowerMin')).toHaveAttribute('aria-valuenow', '1200');
  expect(new URL(page.url()).searchParams.get('power')).toBe('1.2B-2.0B');
  await page.locator('#rankChartPowerMax').press('End');
  await expect(page.locator('#rankChartPowerMaxValue')).toHaveValue('8.0B');
  await page.locator('#rankChartPowerMin').press('Home');
  await expect(page.locator('#rankChartPowerMinValue')).toHaveValue('1.0B');
  await expect(page.locator('#rankChartTitle,#rankChartPageNote,#backToSearchButton,#renderRankChartButton')).toHaveCount(0);
  await expect(page.locator('#rankChartStatus')).toBeHidden();
  for (const width of [1920, 1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect.poll(async () => page.locator('#rankChartCanvasList').evaluate((list) =>
      Math.abs(parseFloat(list.querySelector('canvas').style.width) - Math.max(900, list.clientWidth - 2)) < 1)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    if (width >= 1440) {
      const sizes = await page.locator('#rankChartTabs,#rankChartSortSelect,#exportRankChartsImageButton').evaluateAll((elements) =>
        elements.map((element) => { const r = element.getBoundingClientRect(); return { y: r.y, height: r.height }; }));
      expect(sizes.every((size) => size.height === 40 && Math.abs(size.y - sizes[0].y) < 1)).toBe(true);
      const fields = await page.locator('.rank-chart-range-control,#rankChartKingdomField').evaluateAll((elements) =>
        elements.map((element) => element.getBoundingClientRect().toJSON()));
      expect(Math.abs(fields[0].width - fields[1].width)).toBeLessThan(2);
      expect(fields.every((field) => field.height === 40 && Math.abs(field.y - fields[0].y) < 1)).toBe(true);
      expect((await page.locator('#appViewSwitch').boundingBox()).width).toBeGreaterThan(250);
    }
    if (width === 1920) expect(await page.locator('.rank-heatmap-wrap canvas').evaluate((canvas) => parseFloat(canvas.style.width))).toBeGreaterThan(1440);
    await page.screenshot({ path: path.join(outputDir, `final-ui-${width}.png`) });
  }
  await assertCacheUntouched(page);
});

test('shared data settings open by default without cache and fetch from ranking updates both views', async ({ page }) => {
  const calls = [];
  await page.route('**/api/migration', async (route) => {
    const power = Number(route.request().postDataJSON().power);
    calls.push(power);
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 0,
      data: [{ kingdomId: 1266, rank: power === 1000 ? 10 : 18, num: 90, status: 1 }] }) });
  });
  await page.goto('/ranking/1.0B-1.1B/1266?tab=heatmap-h');
  await expect(page.locator('.app-header #rankChartCacheOptions')).toHaveAttribute('open', '');
  await expect(page.locator('#powerSelect')).toBeVisible();
  expect(calls).toEqual([]);
  await page.locator('#powerSelect').fill('1.0-1.1B');
  await page.locator('#fetchButton').click();
  await expect(page.locator('#rankChartPowerList')).toBeHidden();
  expect(calls).toEqual([1000, 1100]);
  await expect(page.locator('.rank-heatmap-wrap')).toHaveCount(1);
  await expect(page.locator('#rankChartPowerMaxValue')).toHaveValue('1.1B');
  await page.locator('#showKingdomInfoButton').click();
  await expect(page.locator('#resultTable')).toBeVisible();
  await expect(page.locator('#powerSelect')).toBeHidden();
  await page.locator('#rankChartCacheOptionsSummary').click();
  await expect(page.locator('#powerSelect')).toBeVisible();
  await expect(page.locator('#refetchButton')).toBeVisible();
  await page.reload();
  await expect(page.locator('#powerSelect')).toBeHidden();
  expect(calls).toEqual([1000, 1100]);
});

test('search selection and saved lists synchronize the URL and replace the previous ranking selection', async ({ page }) => {
  await openCached(page);
  await page.locator('#rankChartPowerMax').press('Home');
  await page.locator('[data-rank-chart-kingdom="1414"]').click();
  await page.locator('#showKingdomInfoButton').click();
  let url = new URL(page.url());
  expect(url.searchParams.get('power')).toBe('1.0B-1.1B');
  expect(url.searchParams.get('kingdom')).toBe('!1414,1266,1738');
  await page.locator('#kingdomRangeListInput').fill('1266 1414');
  expect(new URL(page.url()).searchParams.get('kingdom')).toBe('1266,1414');
  await page.locator('#kingdomListNameInput').fill('pair');
  await page.locator('#saveKingdomListButton').click();
  await page.locator('#kingdomRangeListInput').fill('1738');
  await page.locator('#savedKingdomListSelect').selectOption('pair');
  expect(new URL(page.url()).searchParams.get('kingdom')).toBe('1266,1414');
  await page.reload();
  await expect(page.locator('#kingdomRangeListInput')).toHaveValue('1266,1414');
  await page.locator('#showRankDistributionButton').click();
  await expect(page.locator('[data-rank-chart-kingdom]')).toHaveCount(2);
  await expect(page.locator('[data-rank-chart-kingdom="1414"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#rankChartPowerMaxValue')).toHaveValue('1.1B');
  expect(page.url()).not.toMatch(/%2c/i);
  await page.reload();
  await expect(page.locator('#rankChartPowerMaxValue')).toHaveValue('1.1B');
  await assertCacheUntouched(page);
});

test('a range without kingdoms persists in the URL and OCR selections carry through search and ranking', async ({ page }) => {
  await openCached(page);
  await page.goto('/ranking?tab=heatmap-h&sort=total-desc&keep=yes#ocr');
  await page.locator('#rankChartPowerMax').press('Home');
  expect(new URL(page.url()).pathname).toBe('/ranking');
  expect(new URL(page.url()).searchParams.get('power')).toBe('1.0B-1.1B');
  await page.reload();
  await expect(page.locator('#rankChartPowerMaxValue')).toHaveValue('1.1B');
  await page.locator('#showKingdomInfoButton').click();
  await page.evaluate(() => {
    window.Tesseract = { PSM: { AUTO: 'auto' }, createWorker: async () => ({
      setParameters: async () => {}, recognize: async () => ({ data: { text: '#1266 #1738' } }),
    }) };
    document.getElementById('ocrDetails').open = true;
  });
  await page.locator('#ocrPrepareButton').click();
  await page.locator('#ocrImageInput').setInputFiles(path.resolve(__dirname, '../assets/examples/ocr-reference-kingdoms.png'));
  await page.locator('#ocrRunButton').click();
  await expect(page.locator('#ocrApplyButton')).toBeEnabled();
  await page.locator('#ocrApplyButton').click();
  await expect(page.locator('#kingdomRangeListInput')).toHaveValue('1266 1738');
  const selected = new URL(page.url());
  expect(selected.searchParams.get('power')).toBe('1.0B-1.1B');
  expect(selected.searchParams.get('kingdom')).toBe('1266,1738');
  expect(selected.searchParams.get('keep')).toBe('yes');
  expect(selected.hash).toBe('#ocr');
  await page.locator('#showRankDistributionButton').click();
  expect(await page.locator('canvas table th[scope="row"]').allTextContents()).toEqual(['K1266', 'K1738']);
  await expect(page.locator('#rankChartSortSelect')).toHaveValue('total-desc');
  await expect(page.locator('#rankChartPowerMaxValue')).toHaveValue('1.1B');
  await page.locator('#showKingdomInfoButton').click();
  await expect(page.locator('#kingdomRangeListInput')).toHaveValue('1266,1738');
  await assertCacheUntouched(page);
});

test('kingdom labels are zero-padded, left-aligned, and monospaced on screen and in PNG output', async ({ page }) => {
  const ids = [1, 12, 123, 1234, 12345];
  await openCached(page, { store: makeStore(ids), ids: ids.join(',') });
  await page.evaluate(() => {
    const draw = CanvasRenderingContext2D.prototype.fillText;
    window.__kingdomLabelDraws = [];
    CanvasRenderingContext2D.prototype.fillText = function (text, x, y, ...args) {
      if (/^K\d+$/.test(text)) window.__kingdomLabelDraws.push({ text, x, align: this.textAlign, font: this.font });
      return draw.call(this, text, x, y, ...args);
    };
  });
  await page.locator('#rankChartTabHeatmapH').click();
  const labels = ['K0001', 'K0012', 'K0123', 'K1234', 'K12345'];
  expect(await page.locator('canvas table th[scope="row"]').allTextContents()).toEqual(labels);
  expect(pngSize((await exportFile(page)).data).width).toBe(2880);
  const draws = await page.evaluate(() => window.__kingdomLabelDraws);
  expect([...new Set(draws.map((draw) => draw.text))]).toEqual(labels);
  for (const label of labels) expect(draws.filter((draw) => draw.text === label && draw.x === 24 && draw.align === 'left' && draw.font.includes('monospace')).length).toBeGreaterThanOrEqual(2);
  await assertCacheUntouched(page);
});

test('both views keep the common menu near the top and reflow without page overflow', async ({ page }) => {
  await openCached(page);
  await page.locator('#languageSelect').selectOption('ja');
  await page.locator('#rankChartTabHeatmapH').click();
  await fs.mkdir(outputDir, { recursive: true });
  for (const width of [1920, 1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    const ranking = await page.locator('.app-header').boundingBox();
    expect(ranking.y).toBeGreaterThanOrEqual(8);
    expect(ranking.y).toBeLessThanOrEqual(12);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.locator('#showKingdomInfoButton').click();
    const search = await page.locator('.app-header').boundingBox();
    expect(search.y).toBe(ranking.y);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    const filter = await page.locator('.side-panel').boundingBox();
    const searchInput = await page.locator('#searchInput').boundingBox();
    expect(filter.x + filter.width).toBeLessThanOrEqual(width);
    expect(searchInput.x + searchInput.width).toBeLessThanOrEqual(filter.x + filter.width);
    await page.screenshot({ path: path.join(outputDir, `final-search-${width}.png`) });
    await page.locator('#showRankDistributionButton').click();
    if (width <= 390) {
      await page.locator('#rankChartCacheOptionsSummary').click();
      const panel = await page.locator('.rank-chart-cache-options-body').boundingBox();
      expect(panel.x).toBeGreaterThanOrEqual(0);
      expect(panel.x + panel.width).toBeLessThanOrEqual(width);
      await page.locator('#closeDataSettingsButton').click();
    }
    await page.screenshot({ path: path.join(outputDir, `final-ranking-${width}.png`) });
  }
  await assertCacheUntouched(page);
});

test('directly opened index retains selection in query parameters while switching views', async ({ page }) => {
  const store = makeStore([1266, 1414]);
  await page.addInitScript(({ store }) => {
    localStorage.setItem('lm_migration_cache_store_v1', JSON.stringify(store));
    localStorage.setItem('lm_language_v1', 'en');
  }, { store });
  await page.goto(`file://${path.resolve(__dirname, '../index.html')}?view=ranking&power=1.0B-1.4B&kingdom=1266,!1414&tab=heatmap-h&sort=average-desc`);
  await expect(page.locator('.rank-heatmap-wrap')).toHaveCount(1);
  await page.locator('#showKingdomInfoButton').click();
  expect(new URL(page.url()).protocol).toBe('file:');
  expect(new URL(page.url()).searchParams.get('view')).toBe('kingdom');
  await page.locator('#showRankDistributionButton').click();
  expect(new URL(page.url()).searchParams.get('view')).toBe('ranking');
  await expect(page.locator('[data-rank-chart-kingdom="1414"]')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#rankChartPowerMaxValue')).toHaveValue('1.4B');
});

test('graph tabs keep the same left positions and widths when changing modes', async ({ page }) => {
  await openCached(page);
  await page.locator('#languageSelect').selectOption('ja');
  for (const width of [1440, 1024, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.locator('#rankChartTabHeatmapH').click();
    const positions = () => page.locator('#rankChartTabs [role="tab"],#exportRankChartsImageButton').evaluateAll((elements) =>
      elements.map((element) => { const r = element.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; }));
    const before = await positions();
    for (const type of ['line', 'bar', 'heatmap-v', 'heatmap-h']) {
      await page.locator(`[role="tab"][data-chart-type="${type}"]`).click();
      expect(await positions()).toEqual(before);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
  await assertCacheUntouched(page);
});

test('backfills weighted averages, sorts unknown averages last, and reuses them without overwriting source cache', async ({ page }) => {
  const store = makeStore([1414, 1266, 1738, 1805]);
  for (const cache of Object.values(store.items)) cache.kingdomList.find((row) => row.kingdomId === 1738).rank = 20;
  await openCached(page, { store, ids: '1414,1266,1738,1805' });
  const average = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).average, cacheKey);
  expect(average.unit).toBe('M');
  expect(average.method).toBe('band-midpoint-weighted');
  expect(average.ranges['1000-1400'].values['1266']).toBeCloseTo(1236.6666666667);
  expect(average.ranges['1000-1400'].values['1414']).toBe(1150);
  expect(average.ranges['1000-1400'].values['1738']).toBeNull();
  expect(await page.evaluate(() => Object.values(Chart.instances).every((chart) =>
    chart.config.plugins.some((plugin) => plugin.id === 'migrationAverage')))).toBe(true);
  await page.locator('#rankChartTabHeatmapH').click();
  await page.locator('#rankChartSortSelect').selectOption('average-asc');
  expect(await page.locator('canvas table th[scope="row"]').allTextContents())
    .toEqual(['K1414', 'K1805', 'K1266', 'K1738']);
  await expect(page.locator('canvas table th[scope="row"]').filter({hasText: 'K1266'}))
    .toHaveAttribute('aria-label', /1.24 B/);
  const writes = await page.evaluate(() => window.__averageWrites);
  await page.locator('#rankChartSortSelect').selectOption('average-desc');
  await page.locator('#rankChartTabHeatmapV').click();
  expect(await page.locator('canvas table th[scope="row"]').allTextContents())
    .toEqual(['K1266', 'K1805', 'K1414', 'K1738']);
  expect(await page.evaluate(() => window.__averageWrites)).toBe(writes);
  const output = await exportFile(page);
  expect(pngSize(output.data).width).toBe(2880);
  await assertCacheUntouched(page);
});

test('aggregates new fetched data into average metadata at the end of a batch', async ({ page }) => {
  const calls = [];
  await page.route('**/api/migration', async (route) => {
    const power = Number(route.request().postDataJSON().power);
    calls.push(power);
    await route.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify({code:0,
      data: [{kingdomId:1266, rank:power === 1000 ? 10 : power === 1100 ? 12 : 18, num:90, status:1}]})});
  });
  await page.goto('/');
  await page.locator('#powerSelect').fill('1.0-1.2B');
  await page.locator('#fetchButton').click();
  await expect(page.locator('#status')).toContainText('Cached 3 entries');
  expect(calls).toEqual([1000,1100,1200]);
  const cache = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), cacheKey);
  expect(cache.average.ranges['1000-1200'].values['1266']).toBe(1125);
  expect(Object.keys(cache.items)).toHaveLength(3);
});
