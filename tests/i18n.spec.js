const { test, expect } = require("playwright/test");

const localeChecks = [
  {
    code: "fr",
    title: "Vérificateur de parchemins de migration",
    power: "Puissance de recherche",
    fetchButton: "Récupérer les données",
    dir: "ltr",
  },
  {
    code: "ko",
    title: "이민 스크롤 확인기",
    power: "검색 전투력",
    fetchButton: "데이터 조회",
    dir: "ltr",
  },
  {
    code: "zh-CN",
    title: "移民卷轴检查器",
    power: "搜索战力",
    fetchButton: "获取数据",
    dir: "ltr",
  },
  {
    code: "ar",
    title: "مدقق لفائف الهجرة",
    power: "قوة البحث",
    fetchButton: "جلب البيانات",
    dir: "rtl",
  },
];

test.describe("i18n locale switching", () => {
  test("switches representative non-English locales in the browser", async ({ page }) => {
    await page.goto("/");

    for (const locale of localeChecks) {
      await page.selectOption("#languageSelect", locale.code);
      await expect(page.locator("html")).toHaveAttribute("lang", locale.code);
      await expect(page.locator("html")).toHaveAttribute("dir", locale.dir);
      await expect(page).toHaveTitle(locale.title);
      await expect(page.locator("label[for='powerSelect']")).toHaveText(locale.power);
      await expect(page.locator("#fetchButton")).toHaveText(locale.fetchButton);
    }
  });

  test("switches ranking page labels and chart text to French", async ({ page }) => {
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
    await page.selectOption("#languageSelect", "fr");

    await expect(page.locator("#rankChartTitle")).toHaveText("Distribution des rangs");
    await expect(page.locator("#rankChartCachedPowersLabel")).toHaveText("Listes en cache");
    await expect(page.locator("#rankChartPowerRangeLabel")).toHaveText("Plage de puissance");
    await expect(page.locator("#rankChartKingdomLabel")).toHaveText("IDs de royaume (jusqu’à 3)");
    await expect(page.locator("#renderRankChartButton")).toHaveText("Créer le graphique");
    await expect(page.locator("#rankChartTypeButton")).toContainText("Passer au graphique en courbe");
    await expect(page.locator("#exportRankChartsImageButton")).toContainText("Enregistrer les graphiques en une image");

    await expect
      .poll(() =>
        page.evaluate(() => {
          const canvas = document.querySelector("#rankChartCanvasList canvas");
          const chart = window.Chart.getChart(canvas);
          return {
            dataset: chart.data.datasets[0].label,
            xAxis: chart.options.scales.x.title.text,
            yAxis: chart.options.scales.y.title.text,
            title: chart.options.plugins.title.text,
          };
        })
      )
      .toEqual({
        dataset: "Joueurs",
        xAxis: "Tranche de puissance",
        yAxis: "Joueurs",
        title: "Distribution des rangs K1780",
      });
  });
});
