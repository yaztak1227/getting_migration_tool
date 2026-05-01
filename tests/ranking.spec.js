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

  test("restores power and kingdom chart inputs from query parameters", async ({ page }) => {
    await page.goto("/ranking?power=1.0-1.2B&kingdom=1780%2C1805");

    await expect(page.locator("#rankChartPage")).toBeVisible();
    await expect(page.locator("#rankChartPowerRangeInput")).toHaveValue("1.0-1.2B");
    await expect(page.locator("#rankChartKingdomInput")).toHaveValue("1780,1805");
  });
});
