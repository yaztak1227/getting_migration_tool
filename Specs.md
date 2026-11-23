# Project Specs

## Purpose

- Provide a Lords Mobile migration kingdom filter tool with minimal setup.
- Primary usage is opening `index.html` directly after download.

## Runtime Modes

- Direct open (`file://`): UI can load, but API access may be restricted by browser security.
- Recommended API mode: run local proxy (`server.js`) with Node.js 24 or later and open `http://127.0.0.1:6080`.
- AWS Lambda mode: package the site files plus Lambda handler from `lambda-work/` and expose the Function URL as the single entrypoint.

## File Structure

- `index.html`: Single-page entry point.
- `styles.css`: Theme variables and UI styling.
- `app.js`: Client logic (theme, cache, fetch, filtering, paging, rendering, browser OCR helper).
- `heatmap.js`: Build-free canvas renderer for themed horizontal/vertical ranking heatmaps, accessible fallback tables, tooltips, and pagination.
- `locales/*.json`: Language resource placeholders (19 files: en, ja, ko, zh-CN, zh-TW, fr, de, es, it, pt, ru, ar, tr, th, vi, id, ms, pl, uk).
- `server.js`: Local proxy to migration API endpoint.
- `.nvmrc` / `.node-version`: Project-local Node.js version hint files pinned to major version 24.
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
- JSZip `3.10.1`
- Chart.js `4.4.8`
- Lucide `0.468.0`

## Theme System

- Theme is selected from a compact dropdown (`themeSelect`) aligned at the right side of the header.
- The header is shared by the filter page and ranking distribution page, so theme switching remains available on both views.
- Available themes: `ocean`, `ivory`, `forest`, `graphite`, `sunset`, `lavender`, `lagoon`, `rosewood`.
- Each theme defines a `$primary` in `hsl(...)` format in `app.js` config.
- On theme apply, `app.js` maps `$primary` to Bulma CSS variables (`--bulma-primary-*`, `--bulma-link-*`) and palette lightness steps.
- The theme selector text, border accent, and soft background tint also derive from the active theme's `$primary`, using a darker readable accent for the selected value.
- Additional theme variables in `styles.css` control panel/table/status coloring.
- Ranking heatmaps derive their sequential color scale from the selected theme's `$primary` (lightness capped at 42% for the darkest cells), and use the same theme surface/text/border tokens as other views. Changing Theme redraws existing chart data without fetching or writing migration caches.
- Button colors use Bulma palette variables (`--bulma-*-soft`, `--bulma-*-bold`, `--bulma-*-invert`, `--bulma-*-dark`) to keep contrast readable across themes.

## Language System (i18n)

- Language is selected from a compact dropdown (`languageSelect`) in the header.
- The header is shared by the filter page and ranking distribution page, so language switching remains available on both views.
- Supported languages: `en`, `ja`, `ko`, `zh-CN`, `zh-TW`, `fr`, `de`, `es`, `it`, `pt`, `ru`, `ar`, `tr`, `th`, `vi`, `id`, `ms`, `pl`, `uk`.
- On first load, language defaults to browser preference (`ja*` => Japanese, otherwise English), then persists in `localStorage` key `lm_language_v1`.
- UI labels, placeholders, button text, status/error messages, tooltip text, and runtime notice are switched via dictionary values in `app.js` (`TRANSLATIONS`).
- For non-bundled languages, app loads `./locales/<code>.json` on language switch and merges `translations` keys onto English fallback text.
- Supported non-bundled locale files contain localized core UI labels (title, filter controls, primary actions, status labels) and ranking chart labels/actions/axis text so switching is visibly reflected across both main views before less-common fallback strings are needed.
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
  - Normalized kingdom rows are stored as compact `[kingdomId, rank, num, status]` tuples with a `tuple-v1` marker and expanded on read. Older object-row caches remain readable. Derived search text is rebuilt when rows are normalized, reducing storage use for wide power ranges such as `1.0-8.0B`.
  - Derived averages are stored under a root `average` key (`version=1`, `unit=M`, `method=band-midpoint-weighted`, `ranges`). Each range records the threshold/rank source signature and per-kingdom mean power. Up to eight ranges are retained.
  - Compatibility: latest snapshot also written to cookie (`lm_migration_cache_v2`).
  - Saved kingdom filter lists: `localStorage` (`lm_saved_kingdom_lists_v1`) with `name`, `value`, `updatedAt`.
  - Selected language: `localStorage` (`lm_language_v1`).
- Behavior:
  - On startup, missing/stale average aggregates are backfilled from existing snapshots without API requests. Fetches update averages; batch fetching aggregates once after the batch. Original snapshot timestamps, request plans, row data, and row serialization are unchanged by average backfill. If metadata persistence exceeds quota, the computed mean still renders and source caches are not evicted for average storage.
  - On load: restores latest valid cache.
  - On power input change: if matching cache exists, renders immediately.
  - On fetch: uses cache unless force refresh; force refresh pulls API.
  - When the power input is a range such as `1.0-2.0B`, fetch runs in 100M steps and stores each power result in the same cache store.
  - If `localStorage` cache writing exceeds the browser quota, the app prunes older cached powers and retries. If the newest result still cannot be stored, the fetch result is still rendered and only cache persistence is skipped.

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

- Text filter: fuzzy match (Fuzzysort), fallback to simple substring.
- Status filter: `all` or `0..4`.
- Kingdom filter input accepts:
  - Range: `1200-1250`
  - List: `1201 1203 1207`
  - Mixed delimiters: comma / space / tab, and `~` variants.
- Scroll filter: min/max numeric range.
- Paging: selectable page size (`30`, `50`, `100`) with prev/next controls, defaulting to `50`.

## UI States

- Status message area for waiting/loading/error/cache usage.
- Filter UI is separated into a left-side menu on desktop layouts.
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
- Result toolbar includes a `グラフに表示` button that navigates to the ranking distribution page with the current power selection and kingdom filter reflected in the ranking URL when available.
- The ranking distribution page uses `/ranking`, with display options exclusively in query parameters, for example `/ranking?power=500M-3.0B&kingdom=1234,!1235&tab=heatmap-h&sort=average-desc`. Legacy `/ranking/<power-selection>/<kingdom-ids>` links remain readable and are normalized to the query format.
- Both views share the compact header: Japanese title `Lordsmobile 移民ツール` (English `Lordsmobile Migration Tool`), an expanding two-segment navigation for `王国情報` / `ランキング分布図`, language/Theme controls, and one 32 px data-settings gear at the far right. The selected segment moves with a short transition; reduced-motion preferences disable the animation. Navigation segments expand into spare horizontal space and wrap into a full-width row on narrower screens. Current view is exposed with aria-current.
- The distribution card has no duplicate title, explanation, or back button. Its toolbar contains graph tabs, a shared sort selector, and image export. Tabs/select/export share a 40 px height and aligned centers; the graph tabs occupy the left column and expand into its available width, with four equal-width buttons. Sort and export have stable columns; the sort selector is visible and usable in all four graph modes. Changing graph mode never moves or resizes the tabs or export button at the same viewport width. Below 1024 px tabs use the first full-width row, with sort/export on the second row. A stable scrollbar gutter prevents mode-dependent horizontal shifts. The four tabs retain tablist/tab/tabpanel semantics and Arrow/Home/End keyboard behavior.
- Both views place the common header 8 px from the top, with a 12 px gap below and responsive 12–24 px side gutters. Framework section/column margins do not introduce extra outer whitespace. Ranking card padding is compact; search filters use border-box sizing and shrinkable grid tracks to remain within their frame at 320 CSS px. Tables and heatmaps scroll within their own panels.
- The ranking distribution page lists cached powers, accepts either multiple cached selections or a direct power/range input, and accepts one or more kingdom IDs.
- Distribution inputs sit immediately above the full-width graph. Power selection and kingdom tags each receive half the desktop row; below 900 px they stack at full width. Both controls are 40 px high. There is no render button or visible/total-count message. Valid input changes update charts and the URL automatically, with brief debouncing for typing/dragging. Incomplete or invalid typing retains the last valid graph; explicit invalid entries report an error. Operational/error messages are shown only when needed.
- The kingdom input is a single-line tag field fixed at 40 CSS px high, with compact 20 px tags and horizontal scrolling inside the field. Each number is a visibility toggle (`aria-pressed`); its separate × button removes it from the list. Off tags remain available, muted/struck through, and use a leading `!` in the `kingdom` query parameter (for example `1266,!1414`). The trailing entry accepts one or more IDs or `!IDs`, commits on Enter/comma/space/slash or leaving the field, and deduplicates additions. Backspace in an empty entry removes the last tag. Invalid entries show an error without changing the selection. Legacy numeric URLs keep every kingdom visible. Visibility applies to all four graph types and image exports, survives tab/sort/Theme/language changes and reload, and does not fetch or overwrite source cache data. All tags may be off; they remain usable to restore visibility, and export is disabled until a kingdom is visible. Removing the last tag clears the charts; IDs can then be added again. Toggling updates the current history entry and preserves power, tab, sort, unrelated query parameters, and hash. Entry/toggle/remove controls are disabled during fetch/export. There is no separate row of kingdom buttons or success/count message. Tag numbers and × controls use pure black or pure white, chosen by measured background contrast independently for on/off backgrounds and recalculated with Theme changes.
- The power control combines editable lower/upper text fields (M/B units) with a dual-thumb range slider. Slider bounds are the minimum/maximum cached powers; values snap to cached thresholds. Logarithmic positions give lower-power bands more room (for a 100M–8B domain, 100M–1B occupies about 53% of the track). Direct entry and slider values stay synchronized. Arrow keys move one cached threshold; Shift+Arrow/Page keys move five; Home/End move to bounds without crossing thumbs. Valid changes redraw automatically, never fetch. With fewer than two cached thresholds the range inputs are disabled.
- Selection is shared through URLs across both views: ranking uses `/ranking?power=<range>&kingdom=<ids>&tab=<type>&sort=<order>`; kingdom info uses the same query on `/`. Paths identify the page; power, kingdom selection, graph type, and sort are optional query state. Direct `file://index.html` use retains its filename and uses `view=ranking|kingdom` to identify the view. OCR apply, saved-list selection/load, and manual kingdom edits synchronize the search URL immediately. Navigation uses the latest URL selection, preserves range, !-prefixed off kingdoms, tab, sort, unrelated query values, and hash, and restores selections after reload/Back/Forward without fetching. Explicit new kingdom selections replace prior visibility flags. Commas and ! remain readable in query values; legacy %2C links still parse. Fetch/cache restore preserves the kingdom filter while resetting other filters, so obtaining data does not lose OCR/saved-list selections.
- A single native-details settings popup in the shared header contains search power (single/range), power candidates, fetch, re-fetch, cached-power selection, and selected-cache refresh. It is open by default only when no cache exists; with cached data it is normally closed. Successful fetches close it and refresh both table data and ranking bounds/chart. Opening/closing/selecting cached data never fetches automatically; only explicit fetch/re-fetch actions call the migration API. Escape, outside click/focus, the gear, or the close control closes the popup. It floats without moving the graph; on mobile it stays within viewport edges and scrolls internally.
- Ranking distribution uses cached data only. Selected powers or direct ranges are expanded to 100M steps between the minimum and maximum power, and each 100M band is shown in the chart. If the target kingdom has non-zero ranks at both thresholds, the chart plots the absolute rank difference as the number of players in that power band; unchanged ranks are plotted as `0`. Missing cache or a threshold with rank `0` is plotted as `0` for that 100M band so the axis remains continuous.
- The bar and line ranking charts are rendered by Chart.js. Each entered kingdom ID is rendered as a separate chart, so three or more distribution charts can be displayed together. Its power and kingdom selection is reflected in the `power` and `kingdom` query parameters so the same cached chart can be reopened repeatedly. Legacy path selections are also parsed on direct open. Chart and sort selections are synchronized to URL query parameters: `tab=bar|line|heatmap-h|heatmap-v` and `sort=kingdom-asc|kingdom-desc|total-desc|total-asc|average-desc|average-asc`. Tab/sort changes update the current history entry (no extra Back-button entries), and page reload/bookmarks restore both values before drawing. Missing or unrecognized values fall back to `bar` and `kingdom-asc` and are normalized into the URL even without cached data. Navigation from search carries the current chart/sort selection. Rendering new power/kingdom inputs canonicalizes those selections into query parameters, removes stale plural aliases (`powers`, `kingdoms`), and preserves unrelated query parameters and hashes. URL restoration performs no migration fetch or cache writes.
- `H横` combines kingdoms as rows and 100M power bands as columns, sorted by the selected kingdom order, with an integrated summary column at the right showing player totals and average power together, a filled total bar with the average-power marker overlaid on the same track. `H縦` puts kingdoms in columns and power bands in rows, with higher power at the top. All four graph modes share a sort dropdown with six options: kingdom ID ascending (default), kingdom ID descending, full-range total descending/ascending, and average power descending/ascending. Unknown averages are always placed last. Totals ties use kingdom ID ascending. The selected order is kept across all four graph modes, Theme, and language changes and is applied globally before panel/PNG/ZIP splitting; it never reorders power bands or changes their counts. Bar/line panels use the same kingdom order as the heatmaps, independently of the input tag order. PNG/ZIP exports preserve this order, with bar/line ZIPs split into five-kingdom groups only after the complete selection is sorted. The dropdown is disabled during fetch/export. Heatmaps are drawn with local plain canvas code; no extra CDN dependency is required.
- Heatmap kingdom labels use `K` plus at least four zero-padded digits (`K0001`, `K0123`, `K1550`); longer IDs are preserved. Horizontal row labels are left-aligned with a monospaced font. Vertical labels, accessible table labels, tooltips, and PNG exports use the same padded format.
- Average power is an estimate: sum of each available 100M band's midpoint power times its player count, divided by the total counted players in the selected range. Missing caches/kingdoms, rank-0 endpoints, and unavailable bands are excluded. A range with no observed players has a null (unavailable) average rather than zero. Results are stored in M units and displayed in B with two decimals.
- Average comparison markers are read-only number-line-style bars, without circular dots. Bar/line charts draw a solid vertical bar at the kingdom's average power. Horizontal heatmaps use thin 1 CSS px vertical bars spanning the full kingdom-row height over the distribution, with the outline clipped inside the row; the summary track retains its short vertical markers; vertical heatmaps use short horizontal bars at the corresponding power row. The horizontal summary combines totals and average power in one `範囲内合計` column, with a `人数 / 平均パワー` subheading, paired numeric values, and a common-range comparison track below each pair. Markers use the selected Theme and are included in fixed-resolution PNG/ZIP exports; paged exports retain the full-range average and track scale.
- Heatmaps preserve the same absolute-rank-difference counts as bar/line, but additionally distinguish unavailable bands (missing threshold cache, missing kingdom, or rank 0) using gray cells with diagonal hatching. A genuine zero is white. Their common legend and cell tooltip show counts/unavailability. Canvas fallback tables expose each kingdom/band value to assistive technology. An asterisk on a horizontal total denotes that unavailable bands were excluded.
- Heatmaps use a common maximum count/color scale and average-comparison power scale across all kingdoms and export pages. The horizontal summary reserves a compact 160 CSS px column (12 px side padding) so the distribution retains more width. It shows a filled player-total bar below the paired numbers, with the average-power vertical marker centered on the same track. Bar length uses the total-player scale; marker position uses the selected power-range scale. Total bars share the largest full-range kingdom total as their scale across every display/export page, retain Theme colors, and have zero length for zero players. The on-screen heatmap combines the complete kingdom and power-band selection into one panel, including ranges such as 1.0–10.0B. Only image export splits selections into pages of up to 45 kingdoms and 70 bands, without dropping kingdoms or bands. Total-based sorting and displayed totals always use the full selected power range. Wide canvases scroll inside their panel on narrow screens. The on-screen canvas uses the complete available panel width (minimum 900 CSS px with internal scrolling on small screens), updates after resizing, and omits the duplicate canvas title/description to keep the data near the controls. Export retains its full title/description and fixed resolution.
- Ranking distribution text contrast prioritizes readability: heading notes, field labels, chart axis labels/ticks, and chart status text use strong foreground colors rather than muted styles.
- When multiple ranking charts are displayed, their Y-axis maximum is shared across all charts as the largest plotted count plus 1 so kingdom distributions can be compared on the same scale.
- Ranking chart panels use equal heights with an 18rem minimum and a viewport-aware height calculation that leaves room for the header and action row before fitting two charts comfortably on a desktop viewport.
- The ranking distribution page includes a button to save currently displayed charts via html2canvas. Bar/line export remains one PNG for 1–4 kingdoms, or a ZIP of PNGs grouped by 5 kingdoms for 5 or more. Heatmaps export one combined PNG for up to 45 kingdoms × 70 power bands; larger selections export all panels as PNGs in one ZIP. All ranking exports keep a fixed width of 1440 CSS px and captureScale=2 (2880 output pixels), independent of viewport width. Filenames include `bar`, `line`, `heatmap-h`, or `heatmap-v` and multi-image parts are numbered.
- During chart export, graph tabs, Theme/language, ranking inputs, refresh/render, and back navigation are disabled; they recover on success or failure. Temporary canvases/DOM are destroyed after capture. Displaying, switching, recoloring, translating, and exporting charts never fetch migration data or rewrite fetched snapshot data. Average metadata may be added or refreshed when necessary, without changing the original snapshot contents; explicit fetch/refresh actions retain their existing behavior.
- Both the search page and ranking distribution page include a shared floating `先頭へ戻る` button (up-arrow icon) that appears after scrolling down and smoothly returns to the top when clicked.
- Exported images use a decorated summary-card layout; when the current page has 20 or more rows, the exported image splits the table into left/right columns for easier scanning.
- Image export rendering uses fixed capture scale and fixed export widths, so output resolution/clarity is consistent regardless of the current display size or browser zoom.
- Ranking chart image export renders charts into an off-screen virtual DOM with fresh canvases before capture, avoiding stretched output from viewport-dependent chart sizing.
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
- OCR candidate extraction targets 4-5 digit numbers. When OCR drops spaces and returns one continuous digit run whose length is a multiple of 4, the run is split into 4-digit kingdom candidates before validation.
- 5-digit candidates are resolved to either the leading 4 digits or trailing 4 digits, choosing the side closer to neighboring accepted candidates; when only one side of context exists, that side is used as the hint.

## Constraints

- No build step required for frontend operation.
- Local JS/CSS files must be referenced by relative paths from `index.html`.
- External libraries should be loaded via CDN.
- When using the local proxy or a Node-based deployment/runtime for `server.js`, Node.js 24 or later is required.
- Lambda deployment assets are maintained separately under `lambda-work/` so the direct-open frontend flow remains unchanged.

## Verification

- Playwright E2E covers representative non-English locale switching (`fr`, `ko`, `zh-CN`, `ar`) and checks document language, direction, title, and primary action labels after switching.
- `docs/heatmap-regression.md` records pre-change chart specifications and the regression checklist. Heatmap E2E tests use isolated seeded caches, prohibit migration API calls/cache writes, and verify counts, missing data, tabs/keyboard, themes, locales, mobile layout, real PNG dimensions, ZIP contents, and export failure cleanup.
