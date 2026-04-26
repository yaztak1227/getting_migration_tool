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
- `app.js`: Client logic (theme, cache, fetch, filtering, paging, rendering).
- `server.js`: Local proxy to migration API endpoint.
- `lordsmobile-api-spec.md`: External API behavior memo.
- `Agents.md`: Project operating rules.

## Frontend Dependencies (CDN)
- Bulma `1.0.4`
- Axios `1.8.4`
- Fuzzysort `3.1.0`

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
- Summary panel (total and filtered counts + request conditions).
- Empty state when no rows match.
- Theme-aware table colors including head/stripe/hover and text contrast.

## Constraints
- No build step required for frontend operation.
- Local JS/CSS files must be referenced by relative paths from `index.html`.
- External libraries should be loaded via CDN.
