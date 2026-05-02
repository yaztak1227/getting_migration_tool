# Project Specs

## Purpose
- Provide a Lords Mobile migration kingdom search tool with minimal setup.
- Primary usage is opening `index.html` directly after download.

## Runtime Modes
- Direct open (`file://`): UI can load, but API access may be restricted by browser security.
- Recommended API mode: run local proxy (`server.js`) and open `http://127.0.0.1:6080`.
- AWS Lambda mode: package the site files plus Lambda handler from `lambda-work/` and expose the Function URL as the single entrypoint.

## File Structure
- `index.html`: Single-page entry point.
- `styles.css`: Theme variables and UI styling.
- `app.js`: Client logic (theme, cache, fetch, filtering, paging, rendering, browser OCR helper).
- `locales/*.json`: Language resource placeholders (19 files: en, ja, ko, zh-CN, zh-TW, fr, de, es, it, pt, ru, ar, tr, th, vi, id, ms, pl, uk).
- `server.js`: Local proxy to migration API endpoint.
- `lambda-work/`: AWS Lambda deployment work area (`lambda-handler.js`, `template.yaml`, packaging script, local build output).
- `assets/examples/ocr-reference-kingdoms.png`: OCR参考画像のホバープレビュー用ファイル。
- `lordsmobile-api-spec.md`: External API behavior memo.
- `Agents.md`: Project operating rules.

## Frontend Dependencies (CDN)
- Bulma `1.0.4`
- jQuery `3.7.1`
- Axios `1.8.4`
- Fuzzysort `3.1.0`
- Tesseract.js `6.x`
- Multiple Select `2.3.0`
- html2canvas `1.4.1`
- Chart.js `4.4.8`
- Lucide `0.468.0`

## Theme System
- Theme is selected from a compact dropdown (`themeSelect`) aligned at the right side of the header.
- The header is shared by the search page and ranking distribution page, so theme switching remains available on both views.
- Available themes: `ocean`, `ivory`, `forest`, `graphite`, `sunset`, `lavender`, `lagoon`, `rosewood`.
- Each theme defines a `$primary` in `hsl(...)` format in `app.js` config.
- On theme apply, `app.js` maps `$primary` to Bulma CSS variables (`--bulma-primary-*`, `--bulma-link-*`) and palette lightness steps.
- The theme selector text, border accent, and soft background tint also derive from the active theme's `$primary`, using a darker readable accent for the selected value.
- Additional theme variables in `styles.css` control panel/table/status coloring.
- Button colors use Bulma palette variables (`--bulma-*-soft`, `--bulma-*-bold`, `--bulma-*-invert`, `--bulma-*-dark`) to keep contrast readable across themes.

## Language System (i18n)
- Language is selected from a compact dropdown (`languageSelect`) in the header.
- The header is shared by the search page and ranking distribution page, so language switching remains available on both views.
- Supported languages: `en`, `ja`, `ko`, `zh-CN`, `zh-TW`, `fr`, `de`, `es`, `it`, `pt`, `ru`, `ar`, `tr`, `th`, `vi`, `id`, `ms`, `pl`, `uk`.
- On first load, language defaults to browser preference (`ja*` => Japanese, otherwise English), then persists in `localStorage` key `lm_language_v1`.
- UI labels, placeholders, button text, status/error messages, tooltip text, and runtime notice are switched via dictionary values in `app.js` (`TRANSLATIONS`).
- For non-bundled languages, app loads `./locales/<code>.json` on language switch and merges `translations` keys onto English fallback text.
- Supported non-bundled locale files contain localized core UI labels (title, search/filter controls, primary actions, status labels) so switching is visibly reflected even before less-common fallback strings are needed.
- If locale file loading fails (e.g. direct `file://` restrictions in some browsers), app keeps working with fallback strings and still allows language selection.
- Result/status date-time text uses locale-aware formatting (`ja-JP` / `en-US`) based on current language.
- Document direction is switched to RTL only for Arabic (`ar`), otherwise LTR.
- Kingdom status labels are switched by language dictionary and used consistently in filter options and table rendering.
- Existing cache/saved-list data schema is unchanged by language switching.

## Data Fetch and Cache
- API call is POST `/api/migration` via local proxy.
- Request defaults: `num=90`, `status=0`, `order=1`.
- Cache validity: 24 hours.
- Cache storage:
  - Primary: `localStorage` (`lm_migration_cache_store_v1`) by power key.
  - Compatibility: latest snapshot also written to cookie (`lm_migration_cache_v2`).
  - Saved kingdom filter lists: `localStorage` (`lm_saved_kingdom_lists_v1`) with `name`, `value`, `updatedAt`.
  - Selected language: `localStorage` (`lm_language_v1`).
- Behavior:
  - On load: restores latest valid cache.
  - On power input change: if matching cache exists, renders immediately.
  - On fetch: uses cache unless force refresh; force refresh pulls API.
  - When the power input is a range such as `1.0-2.0B`, fetch runs in 100M steps and stores each power result in the same cache store.

## Power Input
- Search power is entered in a free text input (`powerSelect`).
- A separate candidate dropdown (`powerCandidateSelect`) is provided for quick selection.
- In the main fetch controls, `powerSelect` and `powerCandidateSelect` are shown side by side on tablet/desktop widths.
- Accepted formats:
  - `{xxx.x}B` (up to one decimal place), e.g. `3.5B`
  - `{xxxx}M`, e.g. `3500M`
  - raw integer (treated as M), e.g. `3500`
- Fetch also accepts power ranges such as `1.0-2.0B`, `1000-2000M`, or separated power lists; ranges are expanded in 100M steps.
- Input is normalized internally to M units for API/cache keys.
- Candidate dropdown includes:
  - built-in range (`100M` to `3.0B` in 100M steps)
  - power values found in local cache, including values above `3.0B`

## Filtering and Paging
- Text search: fuzzy match (Fuzzysort), fallback to simple substring.
- Status filter: `all` or `0..4`.
- Kingdom filter input accepts:
  - Range: `1200-1250`
  - List: `1201 1203 1207`
  - Mixed delimiters: comma / space / tab, and `~` variants.
- Scroll filter: min/max numeric range.
- Paging: selectable page size (`30`, `50`, `100`) with prev/next controls, defaulting to `50`.

## UI States
- Status message area for waiting/loading/error/cache usage.
- Search/filter UI is separated into a left-side menu on desktop layouts.
- Desktop layout uses a fluid-width shell so the left menu + main result area can expand across the viewport.
- On mobile/tablet narrow layouts (Bulma desktop breakpoint under `1024px`), the left menu stacks above the result area and is toggled with a drawer summary.
- Saved-list control rows collapse to single-column on medium/small widths to avoid button overlap.
- Kingdom status filter uses Multiple Select (`multiple-select`) over a native `select[multiple]`, showing a checkbox dropdown with search for statuses `1..4` only; labels are shown without numeric suffixes, and when none are selected, all statuses are included.
- The sidebar column is kept between about `19rem` and `22rem` on desktop and released to `max-width: 100%` on narrower widths.
- A visible gap is kept between the sidebar and main content on desktop, and between stacked blocks on narrower widths.
- Form controls and buttons use `width: 100%`, `min-width: 0`, and button text wrapping so labels do not push the side panel wider.
- OCR helper area:
  - OCR helper is placed as a collapsible optional section directly below the kingdom filter input.
  - OCR helper summary text is `画像から読み込む`.
  - `画像例` hover shows a bundled reference image preview.
  - `OCRをダウンロード` button preloads browser OCR resources.
  - image file input accepts multiple images.
  - OCR result text is shown in a readonly textarea.
  - extracted kingdom candidates can be applied to `kingdomRangeListInput`.
- Saved kingdom list area:
  - current kingdom filter text can be stored with a user-defined name.
  - saved lists can be selected/loaded/deleted later from localStorage.
  - selecting a saved list reflects its kingdom numbers directly into `kingdomRangeListInput`.
  - save controls are grouped as `現在の条件を保存`, and load/delete controls are grouped as `保存済みリストを使う` to keep the action flow clear on narrow widths.
  - within those groups, save name + save button and load + delete buttons are arranged horizontally where space allows, and the saved-list selector expands to the parent width.
  - layout is controlled with Bulma responsive classes (`columns` / `column` / `is-*-mobile|tablet` / `is-fullwidth`) rather than custom grid CSS.
  - controls in the kingdom filter section stay within the section frame without horizontal overflow.
- Result area is shown in the right column with pager, empty state, table, and cache info.
- Result toolbar includes a button to export the currently displayed table page as a formatted PNG image.
- Result toolbar includes a `グラフに表示` button that navigates to the ranking distribution page.
- The ranking distribution page is shown when the URL path is `/ranking` or `/ranking/<power-selection>/<kingdom-ids>`. It also accepts query parameters such as `/ranking?power=1.0-2.0B&kingdom=1234,1235`.
- The ranking distribution page keeps the same shared header as the search page, including language and theme controls.
- The ranking distribution page header places an icon-only back-to-search action at the left edge, while chart type toggle and combined chart image export actions are icon-labeled buttons aligned to the right and wrapping on narrow screens.
- In ranking view, the shared page header section, ranking card header, and ranking card content use compact vertical padding so more chart area remains visible.
- The ranking distribution page lists cached powers, accepts either multiple cached selections or a direct power/range input, and asks for 1-3 kingdom IDs.
- Ranking distribution uses cached data only. Selected powers or direct ranges are expanded to 100M steps between the minimum and maximum power, and each 100M band is shown in the chart. If the target kingdom has non-zero ranks at both thresholds, the chart plots the absolute rank difference as the number of players in that power band; unchanged ranks are plotted as `0`. Missing cache or a threshold with rank `0` is plotted as `0` for that 100M band so the axis remains continuous.
- The ranking distribution chart is rendered by Chart.js and can be switched between bar and line chart types. Up to 3 kingdom IDs are rendered as separate charts. Its selection state is reflected in the URL path as `/ranking/<power-selection>/<kingdom-ids>` so the same cached chart can be reopened repeatedly in local server mode. Query parameters are also parsed on direct open.
- Ranking chart panels use equal heights with an 18rem minimum and a viewport-aware height calculation that leaves room for the header and action row before fitting two charts comfortably on a desktop viewport.
- The ranking distribution page includes a button to save all currently displayed charts as one PNG image via html2canvas.
- Exported images use a decorated summary-card layout; when the current page has 20 or more rows, the exported image splits the table into left/right columns for easier scanning.
- Exported image summary chips include the power used for the currently displayed fetched data.
- Result table stays inside the result column with horizontal scrolling when the available width is narrower than the table minimum.
- Result table headers support client-side sorting for `王国番号`, `必要巻物`, `王国状態`, and `ランク`; sorting is applied to the full filtered result set before pagination.
- The `ランク` header includes a small `!` tooltip trigger; on hover/focus it explains that `0はランク外です`.
- Result table shows status labels without numeric suffixes.
- Result metadata header merges total fetched count and display status into one line (fetched/filter/display range).
- Cache usage note is shown as a compact small text line above the table area when results are visible (e.g. `キャッシュを利用しました（YYYY/MM/DD HH:MM:SS の取得結果）。`).
- Empty state when no rows match.
- Theme-aware table colors including head/stripe/hover and text contrast.
- Tooltip/popover UI is hidden from layout flow when inactive so it does not introduce horizontal overflow.

## OCR Helper
- Browser OCR behavior is inspired by `ogwata/ndlocr-lite-web-ai`, but implemented in this project without a build step.
- OCR runs client-side through CDN-loaded `tesseract.js`.
- First OCR preparation downloads language/model assets in the browser cache.
- OCR candidate extraction targets 4-5 digit numbers.
- 5-digit candidates are resolved to either the leading 4 digits or trailing 4 digits, choosing the side closer to neighboring accepted candidates; when only one side of context exists, that side is used as the hint.

## Constraints
- No build step required for frontend operation.
- Local JS/CSS files must be referenced by relative paths from `index.html`.
- External libraries should be loaded via CDN.
- Lambda deployment assets are maintained separately under `lambda-work/` so the direct-open frontend flow remains unchanged.

## Verification
- Playwright E2E covers representative non-English locale switching (`fr`, `ko`, `zh-CN`, `ar`) and checks document language, direction, title, and primary action labels after switching.
