const { test, expect } = require("playwright/test");

function buildCache(power, kingdomList) {
  return {
    requestedAt: new Date().toISOString(),
    requestPlan: {
      power,
      num: 90,
      status: 0,
      order: 1,
      url: "/api/migration",
      method: "POST",
    },
    requestPayload: {
      power,
      num: 90,
      status: 0,
      order: 1,
    },
    kingdomList,
  };
}

test.describe("ranking page", () => {
  test("restores power and kingdom chart inputs from the URL path", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      const baseRows = [
        { kingdomId: 1780, rank: 10, num: 90, status: 1 },
        { kingdomId: 1805, rank: 30, num: 90, status: 1 },
      ];
      const store = {
        items: {
          1000: buildCacheForBrowser(1000, baseRows),
          1100: buildCacheForBrowser(1100, [
            { kingdomId: 1780, rank: 15, num: 90, status: 1 },
            { kingdomId: 1805, rank: 30, num: 90, status: 1 },
          ]),
          1200: buildCacheForBrowser(1200, [
            { kingdomId: 1780, rank: 20, num: 90, status: 1 },
            { kingdomId: 1805, rank: 41, num: 90, status: 1 },
          ]),
        },
      };
      localStorage.setItem("lm_migration_cache_store_v1", JSON.stringify(store));

      function buildCacheForBrowser(power, kingdomList) {
        return {
          requestedAt: new Date().toISOString(),
          requestPlan: {
            power,
            num: 90,
            status: 0,
            order: 1,
            url: "/api/migration",
            method: "POST",
          },
          requestPayload: {
            power,
            num: 90,
            status: 0,
            order: 1,
          },
          kingdomList,
        };
      }
    });

    await page.goto("/ranking/1.0-1.2B/1780,1805");

    await expect(page.locator("#rankChartPage")).toBeVisible();
    await expect(page.locator("#languageSelect")).toBeVisible();
    await expect(page.locator("#themeSelect")).toBeVisible();
    await expect(page.locator("#rankChartPowerRangeInput")).toHaveValue("1.0-1.2B");
    await expect(page.locator("#rankChartKingdomInput")).toHaveValue("1780,1805");
    await expect(page.locator(".rank-chart-canvas-wrap")).toHaveCount(2);
    await expect(page.locator("#rankChartStatus")).toContainText("1780, 1805");
  });

  test("switches rendered ranking charts between bar and line types", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      const store = {
        items: {
          1000: buildCacheForBrowser(1000, [{ kingdomId: 1780, rank: 10, num: 90, status: 1 }]),
          1100: buildCacheForBrowser(1100, [{ kingdomId: 1780, rank: 18, num: 90, status: 1 }]),
        },
      };
      localStorage.setItem("lm_migration_cache_store_v1", JSON.stringify(store));

      function buildCacheForBrowser(power, kingdomList) {
        return {
          requestedAt: new Date().toISOString(),
          requestPlan: {
            power,
            num: 90,
            status: 0,
            order: 1,
            url: "/api/migration",
            method: "POST",
          },
          requestPayload: {
            power,
            num: 90,
            status: 0,
            order: 1,
          },
          kingdomList,
        };
      }
    });

    await page.goto("/ranking/1.0-1.1B/1780");
    await expect(page.locator("#rankChartTypeButton")).toContainText("Line");

    await expect
      .poll(() =>
        page.evaluate(() => {
          const canvas = document.querySelector("#rankChartCanvasList canvas");
          return window.Chart.getChart(canvas).config.type;
        })
      )
      .toBe("bar");

    await page.locator("#rankChartTypeButton").click();
    await expect(page.locator("#rankChartTypeButton")).toContainText("Bar");
    await expect
      .poll(() =>
        page.evaluate(() => {
          const canvas = document.querySelector("#rankChartCanvasList canvas");
          return window.Chart.getChart(canvas).config.type;
        })
      )
      .toBe("line");
  });

  test("uses the same Y-axis maximum across five ranking charts", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      const store = {
        items: {
          1000: buildCacheForBrowser(1000, [
            { kingdomId: 1780, rank: 10, num: 90, status: 1 },
            { kingdomId: 1805, rank: 40, num: 90, status: 1 },
            { kingdomId: 1910, rank: 70, num: 90, status: 1 },
            { kingdomId: 2040, rank: 90, num: 90, status: 1 },
            { kingdomId: 2110, rank: 120, num: 90, status: 1 },
          ]),
          1100: buildCacheForBrowser(1100, [
            { kingdomId: 1780, rank: 14, num: 90, status: 1 },
            { kingdomId: 1805, rank: 65, num: 90, status: 1 },
            { kingdomId: 1910, rank: 125, num: 90, status: 1 },
            { kingdomId: 2040, rank: 96, num: 90, status: 1 },
            { kingdomId: 2110, rank: 150, num: 90, status: 1 },
          ]),
        },
      };
      localStorage.setItem("lm_migration_cache_store_v1", JSON.stringify(store));

      function buildCacheForBrowser(power, kingdomList) {
        return {
          requestedAt: new Date().toISOString(),
          requestPlan: {
            power,
            num: 90,
            status: 0,
            order: 1,
            url: "/api/migration",
            method: "POST",
          },
          requestPayload: {
            power,
            num: 90,
            status: 0,
            order: 1,
          },
          kingdomList,
        };
      }
    });

    await page.goto("/ranking/1.0-1.1B/1780,1805,1910,2040,2110");
    await expect(page.locator(".rank-chart-canvas-wrap")).toHaveCount(5);

    const yAxisMaxes = await page.evaluate(() =>
      [...document.querySelectorAll("#rankChartCanvasList canvas")].map((canvas) =>
        window.Chart.getChart(canvas).options.scales.y.max
      )
    );

    expect(yAxisMaxes).toEqual([56, 56, 56, 56, 56]);
  });

  test("carries more than four kingdom IDs from the search page into the ranking URL", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      const kingdomRows = [
        { kingdomId: 1780, rank: 10, num: 90, status: 1 },
        { kingdomId: 1805, rank: 20, num: 90, status: 1 },
        { kingdomId: 1910, rank: 30, num: 90, status: 1 },
        { kingdomId: 2040, rank: 40, num: 90, status: 1 },
        { kingdomId: 2110, rank: 50, num: 90, status: 1 },
      ];
      const nextRows = kingdomRows.map((row, index) => ({
        ...row,
        rank: row.rank + index + 1,
      }));
      const store = {
        items: {
          1000: buildCacheForBrowser(1000, kingdomRows),
          1100: buildCacheForBrowser(1100, nextRows),
        },
      };
      localStorage.setItem("lm_migration_cache_store_v1", JSON.stringify(store));

      function buildCacheForBrowser(power, kingdomList) {
        return {
          requestedAt: new Date().toISOString(),
          requestPlan: {
            power,
            num: 90,
            status: 0,
            order: 1,
            url: "/api/migration",
            method: "POST",
          },
          requestPayload: {
            power,
            num: 90,
            status: 0,
            order: 1,
          },
          kingdomList,
        };
      }
    });
    await page.reload();

    await page.locator("#powerSelect").fill("1.0B 1.1B");
    await page.locator("#kingdomRangeListInput").fill("1780 1805 1910 2040 2110");
    await page.locator("#openRankChartButton").click();

    await expect(page.locator("#rankChartKingdomInput")).toHaveValue("1780,1805,1910,2040,2110");
    await expect(page.locator(".rank-chart-canvas-wrap")).toHaveCount(5);
    const path = await page.evaluate(() => decodeURIComponent(window.location.pathname));
    expect(path).toBe("/ranking/1.0B 1.1B/1780,1805,1910,2040,2110");
  });

  test("exports five or more ranking charts as zipped image batches", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      const kingdomRows = [
        { kingdomId: 1780, rank: 10, num: 90, status: 1 },
        { kingdomId: 1805, rank: 20, num: 90, status: 1 },
        { kingdomId: 1910, rank: 30, num: 90, status: 1 },
        { kingdomId: 2040, rank: 40, num: 90, status: 1 },
        { kingdomId: 2110, rank: 50, num: 90, status: 1 },
        { kingdomId: 2220, rank: 60, num: 90, status: 1 },
      ];
      const store = {
        items: {
          1000: buildCacheForBrowser(1000, kingdomRows),
          1100: buildCacheForBrowser(
            1100,
            kingdomRows.map((row, index) => ({ ...row, rank: row.rank + index + 1 }))
          ),
        },
      };
      localStorage.setItem("lm_migration_cache_store_v1", JSON.stringify(store));

      function buildCacheForBrowser(power, kingdomList) {
        return {
          requestedAt: new Date().toISOString(),
          requestPlan: {
            power,
            num: 90,
            status: 0,
            order: 1,
            url: "/api/migration",
            method: "POST",
          },
          requestPayload: {
            power,
            num: 90,
            status: 0,
            order: 1,
          },
          kingdomList,
        };
      }
    });

    await page.goto("/ranking/1.0-1.1B/1780,1805,1910,2040,2110,2220");
    await expect(page.locator(".rank-chart-canvas-wrap")).toHaveCount(6);

    await page.evaluate(() => {
      window.__rankChartExport = {
        batchSizes: [],
        files: [],
        download: null,
      };
      window.html2canvas = async (element) => {
        window.__rankChartExport.batchSizes.push(element.querySelectorAll("canvas").length);
        return {
          toBlob(callback) {
            callback(new Blob(["png"], { type: "image/png" }));
          },
        };
      };
      window.JSZip = class FakeJSZip {
        file(name, blob) {
          window.__rankChartExport.files.push({ name, type: blob.type });
        }

        async generateAsync(options) {
          return new Blob([JSON.stringify(options)], { type: "application/zip" });
        }
      };
      window.URL.createObjectURL = (blob) => {
        window.__rankChartExport.download = { type: blob.type };
        return "blob:rank-charts";
      };
      window.URL.revokeObjectURL = () => {};
      HTMLAnchorElement.prototype.click = function click() {
        window.__rankChartExport.download.name = this.download;
      };
    });

    await page.locator("#exportRankChartsImageButton").click();

    await expect(page.locator("#rankChartStatus")).toContainText("Saved the chart image(s).");
    const exportResult = await page.evaluate(() => window.__rankChartExport);
    expect(exportResult.batchSizes).toEqual([5, 1]);
    expect(exportResult.files.map((file) => file.name)).toEqual([
      expect.stringMatching(/ranking-charts-bar-\d{8}-\d{4}-part-01\.png/),
      expect.stringMatching(/ranking-charts-bar-\d{8}-\d{4}-part-02\.png/),
    ]);
    expect(exportResult.download.name).toMatch(/ranking-charts-bar-\d{8}-\d{4}\.zip/);
    expect(exportResult.download.type).toBe("application/zip");
  });

  test("restores power and kingdom chart inputs from query parameters", async ({ page }) => {
    await page.goto("/ranking?power=1.0-1.2B&kingdom=1780%2C1805");

    await expect(page.locator("#rankChartPage")).toBeVisible();
    await expect(page.locator("#rankChartPowerRangeInput")).toHaveValue("1.0-1.2B");
    await expect(page.locator("#rankChartKingdomInput")).toHaveValue("1780,1805");
  });
});
