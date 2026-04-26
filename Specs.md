# Project Specs

## Purpose
- Provide a Lords Mobile migration kingdom search tool with minimal setup.
- Primary usage is opening `index.html` directly after download.

## Runtime Modes
- Direct open (`file://`): UI can load, but API access may be restricted by browser security.
- Recommended API mode: run local proxy (`server.js`) and open `http://127.0.0.1:6080`.

## File Structure
- `index.html`: Single-page entry point.
- `styles.css`: Theme variables and UI styling.
- `app.js`: Client logic (theme, cache, fetch, filtering, paging, rendering, browser OCR helper).
- `server.js`: Local proxy to migration API endpoint.
- `assets/examples/ocr-reference-kingdoms.png`: OCR参考画像のホバープレビュー用ファイル。
- `lordsmobile-api-spec.md`: External API behavior memo.
- `Agents.md`: Project operating rules.

## Frontend Dependencies (CDN)
- Bulma `1.0.4`
- Axios `1.8.4`
- Fuzzysort `3.1.0`
- Tesseract.js `6.x`

## Theme System
- Theme is selected from a dropdown (`themeSelect`).
- Available themes: `ocean`, `ivory`, `forest`, `graphite`.
- Each theme defines a `$primary` in `hsl(...)` format in `app.js` config.
- On theme apply, `app.js` maps `$primary` to Bulma CSS variables (`--bulma-primary-*`, `--bulma-link-*`) and palette lightness steps.
- Additional theme variables in `styles.css` control panel/table/status coloring.

## Data Fetch and Cache
- API call is POST `/api/migration` via local proxy.
- Request defaults: `num=90`, `status=0`, `order=1`.
- Cache validity: 24 hours.
- Cache storage:
  - Primary: `localStorage` (`lm_migration_cache_store_v1`) by power key.
  - Compatibility: latest snapshot also written to cookie (`lm_migration_cache_v2`).
  - Saved kingdom filter lists: `localStorage` (`lm_saved_kingdom_lists_v1`) with `name`, `value`, `updatedAt`.
- Behavior:
  - On load: restores latest valid cache.
  - On power select change: if matching cache exists, renders immediately.
  - On fetch: uses cache unless force refresh; force refresh pulls API.

## Filtering and Paging
- Text search: fuzzy match (Fuzzysort), fallback to simple substring.
- Status filter: `all` or `0..4`.
- Kingdom filter input accepts:
  - Range: `1200-1250`
  - List: `1201 1203 1207`
  - Mixed delimiters: comma / space / tab, and `~` variants.
- Scroll filter: min/max numeric range.
- Paging: selectable page size (`30`, `50`, `100`) with prev/next controls.

## UI States
- Status message area for waiting/loading/error/cache usage.
- Search/filter UI is separated into a left-side menu on desktop layouts.
- On mobile/tablet narrow layouts, the left menu stacks above the result area.
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
  - saved lists can be loaded or deleted later from localStorage.
- Result area is shown in the right column with pager, empty state, table, and cache info.
- Summary panel (total and filtered counts + request conditions).
- Empty state when no rows match.
- Theme-aware table colors including head/stripe/hover and text contrast.

## OCR Helper
- Browser OCR behavior is inspired by `ogwata/ndlocr-lite-web-ai`, but implemented in this project without a build step.
- OCR runs client-side through CDN-loaded `tesseract.js`.
- First OCR preparation downloads language/model assets in the browser cache.
- OCR candidate extraction targets 4-5 digit numbers.
- 5-digit candidates are normalized to their trailing 4 digits before filtering.

## Constraints
- No build step required for frontend operation.
- Local JS/CSS files must be referenced by relative paths from `index.html`.
- External libraries should be loaded via CDN.
