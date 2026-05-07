const { test, expect } = require("playwright/test");

test.describe("cache storage", () => {
  test("renders fetched results when cache quota is exceeded and prunes older cache", async ({ page }) => {
    await page.addInitScript(() => {
      const originalSetItem = Storage.prototype.setItem;
      window.__setItemWithoutQuota = (key, value) => originalSetItem.call(window.localStorage, key, value);
      Storage.prototype.setItem = function patchedSetItem(key, value) {
        if (key === "lm_migration_cache_store_v1") {
          const parsed = JSON.parse(String(value));
          if (Object.keys(parsed.items || {}).length > 1) {
            throw new DOMException("quota exceeded", "QuotaExceededError");
          }
        }
        return originalSetItem.call(this, key, value);
      };
    });

    await page.route("**/api/migration", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          code: 0,
          data: [{ kingdomId: 1780, rank: 12, num: 90, status: 1 }],
        }),
      });
    });

    await page.goto("/");
    await page.evaluate(() => {
      const oldCache = {
        requestedAt: "2026-01-01T00:00:00.000Z",
        requestPlan: {
          power: 1000,
          num: 90,
          status: 0,
          order: 1,
          url: "/api/migration",
          method: "POST",
        },
        requestPayload: {
          power: 1000,
          num: 90,
          status: 0,
          order: 1,
        },
        kingdomList: [{ kingdomId: 1001, rank: 99, num: 90, status: 1 }],
      };
      window.__setItemWithoutQuota(
        "lm_migration_cache_store_v1",
        JSON.stringify({ items: { 1000: oldCache } })
      );
    });

    await page.locator("#powerSelect").fill("4.2B");
    await page.locator("#fetchButton").click();

    await expect(page.locator("#status")).toContainText("Fetched latest data.");
    await expect(page.locator("#resultTable")).toBeVisible();
    await expect(page.locator("#resultTable")).toContainText("1,780");

    const storedKeys = await page.evaluate(() => {
      const store = JSON.parse(localStorage.getItem("lm_migration_cache_store_v1"));
      return Object.keys(store.items || {}).sort();
    });
    expect(storedKeys).toEqual(["4200"]);
  });
});
