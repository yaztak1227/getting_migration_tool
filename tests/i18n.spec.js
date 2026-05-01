const { test, expect } = require("playwright/test");

const localeChecks = [
  {
    code: "fr",
    title: "Verificateur de parchemins de migration",
    power: "Puissance de recherche",
    fetchButton: "Recuperer les donnees",
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
});
