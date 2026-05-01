const path = require("path");
const { test, expect } = require("playwright/test");

const referenceImagePath = path.resolve(
  __dirname,
  "../assets/examples/ocr-reference-kingdoms.png"
);

const expectedKingdomList =
  "1162 1165 1171 1173 1202 1205 1208 1221 1222 1236 1245 1255 1265 1306 1320 1355 1357 1368 1399 1400 1412 1430 1459 1460 1462";

test.describe("OCR helper", () => {
  test("applies the expected kingdom list from the reference image", async ({ page }) => {
    test.setTimeout(180000);

    await page.addInitScript(() => {
      localStorage.setItem("lm_language_v1", "ja");
    });

    await page.goto("/");
    await page.evaluate(() => {
      sessionStorage.clear();
      const filterPanel = document.getElementById("filterPanel");
      if (filterPanel) {
        filterPanel.hidden = false;
        filterPanel.open = true;
      }
      const ocrDetails = document.getElementById("ocrDetails");
      if (ocrDetails) {
        ocrDetails.open = true;
      }
    });

    await page.locator("#ocrPrepareButton").click();
    await expect(page.locator("#ocrStatus .message-body")).toHaveText(
      "OCRの準備が完了しました。画像を選んでOCRできます。",
      { timeout: 120000 }
    );

    await page.locator("#ocrImageInput").setInputFiles(referenceImagePath);
    await expect(page.locator("#ocrRunButton")).toBeEnabled();

    await page.locator("#ocrRunButton").click();
    await expect(page.locator("#ocrStatus .message-body")).toHaveText(
      "OCRが完了しました。1枚分の結果をまとめています。",
      { timeout: 120000 }
    );

    await expect(page.locator("#ocrApplyButton")).toBeEnabled();
    await page.locator("#ocrApplyButton").click();

    await expect(page.locator("#kingdomRangeListInput")).toHaveValue(expectedKingdomList);
    await expect(page.locator("#ocrStatus .message-body")).toHaveText(
      "OCRで抽出した王国番号候補をフィルタに反映しました。"
    );
  });
});
