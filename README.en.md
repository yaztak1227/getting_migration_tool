# getting_migration_tool

A browser-based tool for searching and filtering Lords Mobile migration target kingdoms.  
In the simplest workflow, you can download the repository and open `index.html` directly.

## What This Project Does

- Fetches migration target kingdoms by required power
- Filters by kingdom ID, kingdom status, required scrolls, and rank
- Supports paging and client-side table sorting
- Saves and reloads kingdom ID lists
- Extracts kingdom candidates from images with OCR
- Switches the UI across multiple languages, including Japanese and English

## Project Structure

- `index.html`
  - Entry point for the UI
- `app.js`
  - UI logic, API fetch, cache, filtering, and OCR helper
- `styles.css`
  - Theme and layout styling
- `server.js`
  - Local proxy for API access
- `locales/*.json`
  - Translation files for additional languages
- `assets/examples/ocr-reference-kingdoms.png`
  - Reference image for OCR
- `Specs.md`
  - Source of truth for current behavior and structure

## How to Start

### 1. If you only want to view the UI quickly

Open `index.html` directly in your browser.

- Double-click it in Finder on macOS
- Or drag and drop it into a browser window

This requires no setup.  
However, when the app runs via `file://`, browser restrictions may prevent stable API access or OCR asset loading.

### 2. If you want reliable API fetch and OCR

With Node.js installed, run this in the project root:

```bash
npm run start
```

Then open:

```text
http://127.0.0.1:6080
```

Available scripts:

- `npm run start`
- `npm run serve`
- `npm run start:6080`
- `npm run start:6000`

## How to Read the Screen

### Main Screen

![Desktop UI (English)](./docs/readme/ui-now-desktop-en.png)

- Top area
  - Language selector and theme selector
- Left search panel
  - Search text, kingdom status, scroll range, and page size controls
- Kingdom ID filter
  - Supports both range input like `1200-1250` and list input like `1201 1203 1207`
- Saved lists
  - Lets you store and reuse named kingdom ID filters
- OCR section
  - Extracts kingdom candidates from images and applies them to the filter
- Right result area
  - Shows fetch summary, result table, pagination, and cache usage

### Mobile View

![Mobile UI (English)](./docs/readme/ui-now-mobile-en.png)

- On narrow screens, the search panel collapses above the result area.
- The result table can be viewed with horizontal scrolling.

## Typical Usage Flow

1. Open the app, preferably at `http://127.0.0.1:6080`
2. Select the required power and click `Fetch Data`
3. Narrow the results with the filters on the left
4. Use sorting, pagination, saved lists, or OCR as needed

## Notes

- No frontend build step is required.
- External libraries are loaded from CDNs.
- API responses are cached locally.
- See [Specs.md](./Specs.md) for the full current specification.

## Acknowledgements

- The OCR helper flow and the browser-first OCR user experience in this project were developed with reference to [ogwata/ndlocr-lite-web-ai](https://github.com/ogwata/ndlocr-lite-web-ai).
- The OCR feature in this project depends on third-party libraries, and each dependency remains subject to its own copyright and license terms.
- The `ogwata/ndlocr-lite-web-ai` repository states in its README that it uses a dual-license approach (CC BY 4.0 + MIT).

## Third-Party Licenses

The main third-party libraries loaded by this project in the browser, together with the license information confirmed at the time of writing, are listed below.

| Library | Version Used Here | Purpose | License | Reference |
| --- | --- | --- | --- | --- |
| Bulma | 1.0.4 | UI CSS framework | MIT | [jgthms/bulma](https://github.com/jgthms/bulma) |
| multiple-select | 2.3.0 | multi-select UI control | MIT | [wenzhixin/multiple-select](https://github.com/wenzhixin/multiple-select) |
| jQuery | 3.7.1 | DOM utilities and plugin base | MIT | [jQuery License](https://jquery.com/license/) |
| Axios | 1.8.4 | HTTP client | MIT | [axios/axios](https://github.com/axios/axios) |
| fuzzysort | 3.1.0 | client-side fuzzy search | MIT | [farzher/fuzzysort](https://github.com/farzher/fuzzysort) |
| Tesseract.js | 6.x | OCR runtime | Apache-2.0 | [naptha/tesseract.js](https://github.com/naptha/tesseract.js) |
| html2canvas | 1.4.1 | table image export | MIT | [niklasvh/html2canvas](https://github.com/niklasvh/html2canvas) |

## License

This repository is released under the [MIT License](./LICENSE).

- External libraries loaded from CDNs, including OCR-related libraries, are distributed under their own licenses.
- Please review the licenses of those dependencies as needed for your use case.
- The table above reflects the license notices published by the official sites or repositories as checked on 2026-04-26.
