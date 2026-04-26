(() => {
  "use strict";

  const CONFIG = {
    cookieName: "lm_migration_cache_v2",
    cacheStorageKey: "lm_migration_cache_store_v1",
    cookieMaxAgeSec: 60 * 60 * 24 * 7,
    cacheValidMs: 24 * 60 * 60 * 1000,
    themeStorageKey: "lm_theme_v1",
    pageSizeOptions: [30, 50, 100],
    themes: [
      {
        id: "ocean",
        label: "Ocean",
        description: "青系で明るく、コントラスト高め",
        $primary: "hsl(214, 69%, 47%)",
      },
      {
        id: "ivory",
        label: "Ivory",
        description: "暖色系で柔らかく、黒がきつくない",
        $primary: "hsl(30, 59%, 45%)",
      },
      {
        id: "forest",
        label: "Forest",
        description: "緑系で落ち着きつつ視認性重視",
        $primary: "hsl(151, 49%, 36%)",
      },
      {
        id: "graphite",
        label: "Graphite",
        description: "寒色グレー基調で引き締まった見た目",
        $primary: "hsl(211, 28%, 43%)",
      },
    ],
    statusLabelMap: {
      0: "制限なし",
      1: "閑散",
      2: "正常",
      3: "混雑",
      4: "過密",
    },
    api: {
      url: "/api/migration",
      method: "POST",
      defaults: {
        num: 90,
        status: 0,
        order: 1,
      },
    },
  };

  class DomRefs {
    constructor() {
      this.themeRoot = document.documentElement;
      this.themeSelect = document.getElementById("themeSelect");
      this.powerSelect = document.getElementById("powerSelect");
      this.fetchButton = document.getElementById("fetchButton");
      this.refetchButton = document.getElementById("refetchButton");
      this.status = document.getElementById("status");
      this.statusBody = this.status.querySelector(".message-body");
      this.summary = document.getElementById("summary");
      this.requiredScrollsLabel = document.getElementById("requiredScrollsLabel");
      this.summaryDetail = document.getElementById("summaryDetail");
      this.runtimeNotice = document.getElementById("runtimeNotice");
      this.runtimeNoticeBody = this.runtimeNotice.querySelector(".message-body");
      this.filterPanel = document.getElementById("filterPanel");
      this.searchInput = document.getElementById("searchInput");
      this.statusFilter = document.getElementById("statusFilter");
      this.pageSizeSelect = document.getElementById("pageSizeSelect");
      this.resetFiltersButton = document.getElementById("resetFiltersButton");
      this.kingdomRangeListInput = document.getElementById("kingdomRangeListInput");
      this.scrollMinInput = document.getElementById("scrollMinInput");
      this.scrollMaxInput = document.getElementById("scrollMaxInput");
      this.resultMeta = document.getElementById("resultMeta");
      this.filteredCount = document.getElementById("filteredCount");
      this.prevPageButton = document.getElementById("prevPageButton");
      this.nextPageButton = document.getElementById("nextPageButton");
      this.pageIndicator = document.getElementById("pageIndicator");
      this.emptyState = document.getElementById("emptyState");
      this.resultTable = document.getElementById("resultTable");
      this.resultBody = document.getElementById("resultBody");
      this.cacheInfo = document.getElementById("cacheInfo");
    }
  }

  class ThemeManager {
    constructor(config, dom) {
      this.config = config;
      this.dom = dom;
    }

    init() {
      this.initThemeOptions();
      const initialTheme = this.readTheme();
      this.applyTheme(initialTheme);
      this.dom.themeSelect.addEventListener("change", () => {
        this.applyTheme(this.dom.themeSelect.value);
      });
    }

    readTheme() {
      const saved = window.localStorage.getItem(this.config.themeStorageKey);
      return this.isValidTheme(saved) ? saved : this.config.themes[0].id;
    }

    applyTheme(themeId) {
      const theme = this.getTheme(themeId);
      this.dom.themeRoot.dataset.theme = theme.id;
      this.applyPrimaryPalette(theme.$primary);
      this.dom.themeSelect.value = theme.id;
      window.localStorage.setItem(this.config.themeStorageKey, theme.id);
    }

    isValidTheme(themeId) {
      return this.config.themes.some((theme) => theme.id === themeId);
    }

    getTheme(themeId) {
      return this.config.themes.find((item) => item.id === themeId) || this.config.themes[0];
    }

    initThemeOptions() {
      this.dom.themeSelect.innerHTML = "";
      const fragment = document.createDocumentFragment();
      for (const theme of this.config.themes) {
        const option = document.createElement("option");
        option.value = theme.id;
        option.textContent = theme.label;
        fragment.appendChild(option);
      }
      this.dom.themeSelect.appendChild(fragment);
    }

    applyPrimaryPalette(primaryHsl) {
      const parsed = this.parseHsl(primaryHsl) || this.parseHsl(this.config.themes[0].$primary);
      if (!parsed) return;

      const { h, s, l } = parsed;
      const rgb = this.hslToRgb(h, s, l);
      this.dom.themeRoot.style.setProperty("--bulma-primary-h", `${h}deg`);
      this.dom.themeRoot.style.setProperty("--bulma-primary-s", `${s}%`);
      this.dom.themeRoot.style.setProperty("--bulma-primary-l", `${l}%`);
      this.dom.themeRoot.style.setProperty("--bulma-link-h", `${h}deg`);
      this.dom.themeRoot.style.setProperty("--bulma-link-s", `${s}%`);
      this.dom.themeRoot.style.setProperty("--bulma-link-l", `${l}%`);
      this.dom.themeRoot.style.setProperty("--bulma-primary-rgb", rgb.join(", "));
      this.setPaletteLightnessScale("--bulma-primary", l);
      this.setPaletteLightnessScale("--bulma-link", l);
    }

    parseHsl(value) {
      if (typeof value !== "string") return null;
      const match = value.match(
        /^hsl\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*\)$/i
      );
      if (!match) return null;

      const hue = Number(match[1]);
      const saturation = Number(match[2]);
      const lightness = Number(match[3]);
      if (!Number.isFinite(hue) || !Number.isFinite(saturation) || !Number.isFinite(lightness)) return null;

      return {
        h: ((hue % 360) + 360) % 360,
        s: this.clamp(saturation, 0, 100),
        l: this.clamp(lightness, 0, 100),
      };
    }

    hslToRgb(h, s, l) {
      const sat = s / 100;
      const lig = l / 100;
      const c = (1 - Math.abs(2 * lig - 1)) * sat;
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
      const m = lig - c / 2;

      let r1 = 0;
      let g1 = 0;
      let b1 = 0;
      if (h < 60) {
        r1 = c;
        g1 = x;
      } else if (h < 120) {
        r1 = x;
        g1 = c;
      } else if (h < 180) {
        g1 = c;
        b1 = x;
      } else if (h < 240) {
        g1 = x;
        b1 = c;
      } else if (h < 300) {
        r1 = x;
        b1 = c;
      } else {
        r1 = c;
        b1 = x;
      }

      return [
        Math.round((r1 + m) * 255),
        Math.round((g1 + m) * 255),
        Math.round((b1 + m) * 255),
      ];
    }

    setPaletteLightnessScale(prefix, baseLightness) {
      const offset = this.normalizeLightnessOffset(baseLightness);
      for (let step = 0; step <= 100; step += 5) {
        const key = String(step).padStart(2, "0");
        const level = this.clamp(offset + step, 0, 100);
        this.dom.themeRoot.style.setProperty(`${prefix}-${key}-l`, `${level}%`);
      }
    }

    normalizeLightnessOffset(lightness) {
      const normalized = ((lightness % 5) + 5) % 5;
      return Math.round(normalized * 100) / 100;
    }

    clamp(value, min, max) {
      return Math.min(max, Math.max(min, value));
    }
  }

  class CacheStore {
    constructor(config) {
      this.config = config;
    }

    readLegacyCookie() {
      const cookies = document.cookie ? document.cookie.split(";") : [];
      for (const entry of cookies) {
        const [rawKey, ...rest] = entry.trim().split("=");
        if (rawKey !== this.config.cookieName) continue;
        try {
          return JSON.parse(decodeURIComponent(rest.join("=")));
        } catch (error) {
          console.warn("cache parse error", error);
          return null;
        }
      }
      return null;
    }

    readStore() {
      const raw = window.localStorage.getItem(this.config.cacheStorageKey);
      if (!raw) return { items: {} };
      try {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object" || !parsed.items || typeof parsed.items !== "object") {
          return { items: {} };
        }
        return parsed;
      } catch (error) {
        console.warn("localStorage cache parse error", error);
        return { items: {} };
      }
    }

    writeStore(store) {
      window.localStorage.setItem(this.config.cacheStorageKey, JSON.stringify(store));
    }

    readByPower(power) {
      const store = this.readStore();
      const fromStore = store.items[String(power)];
      if (fromStore) return fromStore;

      const legacy = this.readLegacyCookie();
      if (legacy && legacy.requestPlan && Number(legacy.requestPlan.power) === Number(power)) {
        return legacy;
      }
      return null;
    }

    write(value) {
      const key = String(value && value.requestPlan ? value.requestPlan.power : "");
      if (key) {
        const store = this.readStore();
        store.items[key] = value;
        this.writeStore(store);
      }

      // 旧形式との互換のために最新結果をCookieにも保存する（サイズ超過時はlocalStorageのみ有効）。
      const serialized = encodeURIComponent(JSON.stringify(value));
      document.cookie =
        `${this.config.cookieName}=${serialized}; max-age=${this.config.cookieMaxAgeSec}; path=/; SameSite=Lax`;
    }

    isAvailable(cache, requestPlan) {
      if (!cache || typeof cache !== "object" || !cache.requestPlan) return false;

      const requestedAt = Date.parse(cache.requestedAt || "");
      if (!Number.isFinite(requestedAt)) return false;
      if (Date.now() - requestedAt >= this.config.cacheValidMs) return false;

      return (
        Number(cache.requestPlan.power) === Number(requestPlan.power) &&
        Number(cache.requestPlan.num) === Number(requestPlan.num) &&
        Number(cache.requestPlan.status) === Number(requestPlan.status) &&
        Number(cache.requestPlan.order) === Number(requestPlan.order) &&
        String(cache.requestPlan.url) === String(requestPlan.url) &&
        String(cache.requestPlan.method) === String(requestPlan.method)
      );
    }
  }

  class MigrationApi {
    constructor(config) {
      this.config = config;
    }

    buildRequestPlan(power) {
      return {
        power,
        num: this.config.api.defaults.num,
        status: this.config.api.defaults.status,
        order: this.config.api.defaults.order,
        url: this.config.api.url,
        method: this.config.api.method,
      };
    }

    async fetchKingdomList(power) {
      if (!window.axios) {
        throw new Error("axiosの読み込みに失敗しました。ネットワーク接続を確認してください。");
      }

      const response = await window.axios({
        url: this.config.api.url,
        method: this.config.api.method,
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          power,
          num: this.config.api.defaults.num,
          status: this.config.api.defaults.status,
          order: this.config.api.defaults.order,
        },
      }).then((res) => res.data);

      if (response && typeof response === "object" && Number(response.code) !== 0) {
        throw new Error(response.msg || `APIエラー(code=${response.code})`);
      }

      return this.extractList(response);
    }

    extractList(responseJson) {
      if (Array.isArray(responseJson)) return responseJson;
      if (responseJson && typeof responseJson === "object") {
        if (Array.isArray(responseJson.data)) return responseJson.data;
        if (Array.isArray(responseJson.items)) return responseJson.items;
        if (Array.isArray(responseJson.list)) return responseJson.list;
        if (Array.isArray(responseJson.results)) return responseJson.results;
      }
      return [];
    }
  }

  class KingdomFilter {
    constructor(config) {
      this.config = config;
    }

    createDefaultFilters() {
      return {
        query: "",
        status: "all",
        kingdomRangeList: "",
        scrollMin: "",
        scrollMax: "",
        pageSize: this.config.pageSizeOptions[0],
      };
    }

    normalizeRow(row) {
      const normalized = {
        kingdomId: this.readNumber(row, ["kingdom_id", "kingdomId", "id"], NaN),
        rank: this.readNumber(row, ["rank"], 0),
        num: this.readNumber(row, ["num", "scroll", "scrolls"], 0),
        status: this.readNumber(row, ["status"], 0),
      };
      normalized.searchText = this.buildSearchText(normalized);
      return normalized;
    }

    normalizeList(list) {
      const map = new Map();
      if (!Array.isArray(list)) return [];

      for (const row of list) {
        const normalized = this.normalizeRow(row);
        if (!Number.isFinite(normalized.kingdomId)) continue;
        map.set(normalized.kingdomId, normalized);
      }

      return [...map.values()].sort((a, b) => a.kingdomId - b.kingdomId);
    }

    apply(list, filters) {
      const kingdomMatcher = this.createKingdomMatcher(filters.kingdomRangeList);
      let rows = list.filter((row) => this.matchesNumericFilters(row, filters, kingdomMatcher));

      if (filters.status !== "all") {
        rows = rows.filter((row) => row.status === Number(filters.status));
      }

      if (!filters.query) return rows;

      if (!window.fuzzysort) {
        const lowered = filters.query.toLowerCase();
        return rows.filter((row) => row.searchText.toLowerCase().includes(lowered));
      }

      return window.fuzzysort
        .go(filters.query, rows, {
          key: "searchText",
          threshold: -5000,
          all: true,
        })
        .map((result) => result.obj);
    }

    paginate(rows, page, pageSize) {
      const start = (page - 1) * pageSize;
      return rows.slice(start, start + pageSize);
    }

    statusLabel(value) {
      return this.config.statusLabelMap[value] || "不明";
    }

    normalizePageSize(value) {
      const size = Number(value);
      return this.config.pageSizeOptions.includes(size) ? size : this.config.pageSizeOptions[0];
    }

    buildSearchText(row) {
      return [
        row.kingdomId,
        this.statusLabel(row.status),
        row.status,
        row.rank,
        row.num,
        `k${row.kingdomId}`,
      ].join(" ");
    }

    matchesNumericFilters(row, filters, kingdomMatcher) {
      const scrollMin = this.readOptionalNumber(filters.scrollMin);
      const scrollMax = this.readOptionalNumber(filters.scrollMax);

      if (!kingdomMatcher(row.kingdomId)) return false;
      if (scrollMin !== null && row.num < scrollMin) return false;
      if (scrollMax !== null && row.num > scrollMax) return false;
      return true;
    }

    createKingdomMatcher(rawValue) {
      const text = String(rawValue || "").trim();
      if (!text) return () => true;

      const tokens = text.split(/[,\s]+/).map((token) => token.trim()).filter(Boolean);
      if (tokens.length === 0) return () => true;

      const ranges = [];
      const singles = new Set();
      for (const token of tokens) {
        const normalized = token.replace(/[～〜~]/g, "-");
        const rangeMatch = normalized.match(/^(\d+)-(\d+)$/);
        if (rangeMatch) {
          const start = Number(rangeMatch[1]);
          const end = Number(rangeMatch[2]);
          if (!Number.isFinite(start) || !Number.isFinite(end)) continue;
          ranges.push({
            min: Math.min(start, end),
            max: Math.max(start, end),
          });
          continue;
        }

        const single = Number(normalized);
        if (Number.isFinite(single)) {
          singles.add(single);
        }
      }

      if (ranges.length === 0 && singles.size === 0) return () => false;
      return (kingdomId) => {
        if (singles.has(kingdomId)) return true;
        for (const range of ranges) {
          if (kingdomId >= range.min && kingdomId <= range.max) return true;
        }
        return false;
      };
    }

    readNumber(obj, keys, fallback) {
      for (const key of keys) {
        if (!obj || !(key in obj)) continue;
        const value = Number(obj[key]);
        if (Number.isFinite(value)) return value;
      }
      return fallback;
    }

    readOptionalNumber(value) {
      if (value === "") return null;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }
  }

  class MigrationApp {
    constructor(config) {
      this.config = config;
      this.dom = new DomRefs();
      this.themeManager = new ThemeManager(config, this.dom);
      this.cacheStore = new CacheStore(config);
      this.api = new MigrationApi(config);
      this.filter = new KingdomFilter(config);
      this.state = {
        kingdomList: [],
        filteredList: [],
        currentPage: 1,
        filters: this.filter.createDefaultFilters(),
      };
    }

    boot() {
      this.themeManager.init();
      this.initPowerOptions();
      this.initFilterOptions();
      this.bindEvents();
      this.setStatus("待機中です。必要パワーを選んで取得してください。");
      this.setCacheInfo("キャッシュ未使用");
      this.renderRuntimeNotice();
      this.restoreFromCacheOnLoad();
    }

    initPowerOptions() {
      const fragment = document.createDocumentFragment();
      for (let value = 100; value <= 3000; value += 100) {
        const option = document.createElement("option");
        option.value = String(value);
        option.textContent = formatPowerLabel(value);
        fragment.appendChild(option);
      }
      this.dom.powerSelect.appendChild(fragment);
    }

    initFilterOptions() {
      const statusFragment = document.createDocumentFragment();
      const allOption = document.createElement("option");
      allOption.value = "all";
      allOption.textContent = "すべて";
      statusFragment.appendChild(allOption);

      for (const [value, label] of Object.entries(this.config.statusLabelMap)) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = `${label} (${value})`;
        statusFragment.appendChild(option);
      }

      const pageSizeFragment = document.createDocumentFragment();
      for (const size of this.config.pageSizeOptions) {
        const option = document.createElement("option");
        option.value = String(size);
        option.textContent = `${size}件ずつ`;
        pageSizeFragment.appendChild(option);
      }

      this.dom.statusFilter.appendChild(statusFragment);
      this.dom.pageSizeSelect.appendChild(pageSizeFragment);
      this.applyFiltersToUI();
    }

    bindEvents() {
      this.dom.fetchButton.addEventListener("click", () => this.handleFetch(false));
      this.dom.refetchButton.addEventListener("click", () => this.handleFetch(true));
      this.dom.powerSelect.addEventListener("change", () => this.handlePowerChange());
      this.dom.searchInput.addEventListener("input", () => this.handleFilterInput());
      this.dom.statusFilter.addEventListener("change", () => this.handleFilterInput());
      this.dom.pageSizeSelect.addEventListener("change", () => this.handlePageSizeChange());
      this.dom.kingdomRangeListInput.addEventListener("input", () => this.handleFilterInput());
      this.dom.scrollMinInput.addEventListener("input", () => this.handleFilterInput());
      this.dom.scrollMaxInput.addEventListener("input", () => this.handleFilterInput());
      this.dom.resetFiltersButton.addEventListener("click", () => this.resetFilters());
      this.dom.prevPageButton.addEventListener("click", () => this.movePage(-1));
      this.dom.nextPageButton.addEventListener("click", () => this.movePage(1));
    }

    renderRuntimeNotice() {
      if (window.location.protocol !== "file:") {
        this.dom.runtimeNotice.hidden = true;
        return;
      }

      const browserName = this.detectBrowserName();
      this.dom.runtimeNotice.hidden = false;
      this.dom.runtimeNoticeBody.innerHTML =
        `現在は <strong>file://</strong> で開かれています。${this.escapeHtml(browserName)} での直接起動は制約が多いため、` +
        `<strong>http://127.0.0.1:6080</strong> から開くと Node.js のローカルプロキシ経由で取得できます。`;
    }

    async handleFetch(forceRefresh) {
      const power = Number(this.dom.powerSelect.value);
      const requestPlan = this.api.buildRequestPlan(power);
      this.setBusy(true);

      try {
        const cache = this.cacheStore.readByPower(power);
        if (!forceRefresh && this.cacheStore.isAvailable(cache, requestPlan)) {
          this.applyCacheResult(cache, power, requestPlan, "Cookie/LocalStorage");
          return;
        }

        this.setStatus("APIからデータ取得中です...");
        const list = await this.api.fetchKingdomList(power);
        this.state.kingdomList = this.filter.normalizeList(list);
        this.resetFilters({ preservePageSize: true, shouldRerender: false });

        const nowIso = new Date().toISOString();
        this.cacheStore.write({
          requestedAt: nowIso,
          requestPlan,
          requestPayload: {
            power,
            num: this.config.api.defaults.num,
            status: this.config.api.defaults.status,
            order: this.config.api.defaults.order,
          },
          kingdomList: this.state.kingdomList,
        });

        this.render(power, requestPlan);
        this.setStatus("最新データを取得しました。");
        this.setCacheInfo(`参照元: API / 取得日時: ${this.formatDateTime(nowIso)}`);
      } catch (error) {
        console.error(error);
        this.setStatus(this.buildFetchErrorMessage(error), true);
        this.hideResults();
      } finally {
        this.setBusy(false);
      }
    }

    handleFilterInput() {
      this.state.currentPage = 1;
      this.rerender();
    }

    handlePageSizeChange() {
      this.syncFiltersFromUI();
      this.state.currentPage = 1;
      this.rerender();
    }

    movePage(direction) {
      this.state.currentPage += direction;
      this.rerender();
    }

    resetFilters(options = {}) {
      const preservePageSize = options.preservePageSize === true;
      const shouldRerender = options.shouldRerender !== false;
      const currentPageSize = this.filter.normalizePageSize(
        this.dom.pageSizeSelect.value || this.state.filters.pageSize || this.config.pageSizeOptions[0]
      );

      this.state.filters = this.filter.createDefaultFilters();
      this.state.filters.pageSize = preservePageSize ? currentPageSize : this.config.pageSizeOptions[0];
      this.state.currentPage = 1;
      this.applyFiltersToUI();

      if (shouldRerender) this.rerender();
    }

    handlePowerChange() {
      const power = Number(this.dom.powerSelect.value);
      const requestPlan = this.api.buildRequestPlan(power);
      const cache = this.cacheStore.readByPower(power);
      if (this.cacheStore.isAvailable(cache, requestPlan)) {
        this.applyCacheResult(cache, power, requestPlan, "Cookie/LocalStorage");
        return;
      }

      this.state.kingdomList = [];
      this.state.filteredList = [];
      this.state.currentPage = 1;
      this.resetFilters({ preservePageSize: true, shouldRerender: false });
      this.hideResults();
      this.setStatus("この必要パワーのキャッシュはありません。取得するボタンを押してください。");
      this.setCacheInfo("キャッシュ未使用");
    }

    restoreFromCacheOnLoad() {
      const store = this.cacheStore.readStore();
      const entries = Object.values(store.items || {}).filter((entry) => entry && entry.requestedAt);
      const legacy = this.cacheStore.readLegacyCookie();
      if (entries.length === 0 && legacy && legacy.requestedAt) entries.push(legacy);
      if (entries.length === 0) return;

      entries.sort((a, b) => Date.parse(b.requestedAt || "") - Date.parse(a.requestedAt || ""));
      const latest = entries[0];
      const power = Number(latest.requestPlan && latest.requestPlan.power);
      if (!Number.isFinite(power)) return;

      this.dom.powerSelect.value = String(power);
      const requestPlan = this.api.buildRequestPlan(power);
      if (!this.cacheStore.isAvailable(latest, requestPlan)) return;
      this.applyCacheResult(latest, power, requestPlan, "Cookie/LocalStorage");
    }

    rerender() {
      if (this.state.kingdomList.length === 0) return;
      const power = Number(this.dom.powerSelect.value);
      this.render(power, this.api.buildRequestPlan(power));
    }

    render(power, requestPlan) {
      if (this.state.kingdomList.length === 0) {
        this.hideResults();
        this.setStatus("表示可能なデータがありません。", true);
        return;
      }

      this.syncFiltersFromUI();
      this.state.filteredList = this.filter.apply(this.state.kingdomList, this.state.filters);

      const pageSize = this.state.filters.pageSize;
      const totalPages = Math.max(1, Math.ceil(this.state.filteredList.length / pageSize));
      this.state.currentPage = this.clamp(this.state.currentPage, 1, totalPages);
      const pageRows = this.filter.paginate(this.state.filteredList, this.state.currentPage, pageSize);

      this.dom.summary.hidden = false;
      this.dom.filterPanel.hidden = false;
      this.dom.resultMeta.hidden = false;
      this.dom.requiredScrollsLabel.textContent =
        `取得件数: ${this.state.kingdomList.length.toLocaleString()} 件 / 絞り込み: ${this.state.filteredList.length.toLocaleString()} 件`;
      this.dom.summaryDetail.textContent =
        `power=${power.toLocaleString()}M / num=${requestPlan.num} / status=${requestPlan.status}(${this.filter.statusLabel(requestPlan.status)}) / order=${requestPlan.order}`;

      this.renderTable(pageRows);
      this.renderPager(totalPages, pageSize);

      const hasRows = pageRows.length > 0;
      this.dom.emptyState.hidden = hasRows;
      this.dom.resultTable.hidden = !hasRows;
    }

    renderTable(rows) {
      this.dom.resultBody.innerHTML = "";
      for (const row of rows) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${row.kingdomId.toLocaleString()}</td>
          <td>${row.num.toLocaleString()}</td>
          <td>${this.escapeHtml(this.filter.statusLabel(row.status))} (${row.status})</td>
          <td>${row.rank.toLocaleString()}</td>
        `;
        this.dom.resultBody.appendChild(tr);
      }
    }

    renderPager(totalPages, pageSize) {
      const totalCount = this.state.filteredList.length;
      const from = totalCount === 0 ? 0 : (this.state.currentPage - 1) * pageSize + 1;
      const to = totalCount === 0 ? 0 : Math.min(this.state.currentPage * pageSize, totalCount);

      this.dom.filteredCount.textContent =
        `${totalCount.toLocaleString()}件中 ${from.toLocaleString()}-${to.toLocaleString()}件を表示`;
      this.dom.pageIndicator.textContent = `${this.state.currentPage} / ${totalPages}`;
      this.dom.prevPageButton.disabled = this.state.currentPage <= 1 || totalCount === 0;
      this.dom.nextPageButton.disabled = this.state.currentPage >= totalPages || totalCount === 0;
    }

    hideResults() {
      this.dom.summary.hidden = true;
      this.dom.filterPanel.hidden = true;
      this.dom.resultMeta.hidden = true;
      this.dom.emptyState.hidden = true;
      this.dom.resultTable.hidden = true;
    }

    syncFiltersFromUI() {
      this.state.filters = {
        query: this.dom.searchInput.value.trim(),
        status: this.dom.statusFilter.value,
        kingdomRangeList: this.dom.kingdomRangeListInput.value.trim(),
        scrollMin: this.dom.scrollMinInput.value.trim(),
        scrollMax: this.dom.scrollMaxInput.value.trim(),
        pageSize: this.filter.normalizePageSize(this.dom.pageSizeSelect.value),
      };
    }

    applyFiltersToUI() {
      this.dom.searchInput.value = this.state.filters.query;
      this.dom.statusFilter.value = this.state.filters.status;
      this.dom.pageSizeSelect.value = String(this.state.filters.pageSize);
      this.dom.kingdomRangeListInput.value = this.state.filters.kingdomRangeList;
      this.dom.scrollMinInput.value = this.state.filters.scrollMin;
      this.dom.scrollMaxInput.value = this.state.filters.scrollMax;
    }

    setStatus(text, isError = false) {
      this.dom.statusBody.textContent = text;
      this.dom.status.className = isError
        ? "message is-danger is-light status-box"
        : "message is-light status-box";
    }

    setCacheInfo(text) {
      this.dom.cacheInfo.textContent = text;
    }

    setBusy(isBusy) {
      this.dom.themeSelect.disabled = isBusy;
      this.dom.fetchButton.disabled = isBusy;
      this.dom.refetchButton.disabled = isBusy;
      this.dom.powerSelect.disabled = isBusy;
      this.dom.pageSizeSelect.disabled = isBusy;
      this.dom.statusFilter.disabled = isBusy;
      this.dom.searchInput.disabled = isBusy;
      this.dom.kingdomRangeListInput.disabled = isBusy;
      this.dom.scrollMinInput.disabled = isBusy;
      this.dom.scrollMaxInput.disabled = isBusy;
      this.dom.resetFiltersButton.disabled = isBusy;

      if (isBusy) {
        this.dom.prevPageButton.disabled = true;
        this.dom.nextPageButton.disabled = true;
        return;
      }

      const pageSize = this.state.filters.pageSize || this.config.pageSizeOptions[0];
      const totalPages = Math.max(1, Math.ceil((this.state.filteredList.length || 0) / pageSize));
      this.dom.prevPageButton.disabled = this.state.currentPage <= 1 || this.state.filteredList.length === 0;
      this.dom.nextPageButton.disabled =
        this.state.currentPage >= totalPages || this.state.filteredList.length === 0;
    }

    formatDateTime(isoLike) {
      const date = new Date(isoLike);
      if (Number.isNaN(date.getTime())) return "不明";
      return date.toLocaleString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    }

    escapeHtml(value) {
      return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
    }

    clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }

    buildFetchErrorMessage(error) {
      const message = String(error && error.message ? error.message : "不明なエラー");

      if (window.location.protocol === "file:") {
        return `${this.detectBrowserName()} で file:// から開いています。http://127.0.0.1:6080 から開き直してください。`;
      }

      return `取得失敗: ${message}`;
    }

    applyCacheResult(cache, power, requestPlan, sourceLabel) {
      this.state.kingdomList = this.filter.normalizeList(cache.kingdomList);
      this.resetFilters({ preservePageSize: true, shouldRerender: false });
      this.render(power, requestPlan);
      const requestedAtText = this.formatDateTime(cache.requestedAt);
      this.setStatus(`キャッシュを利用しました（${requestedAtText} の取得結果）。`);
      this.setCacheInfo(`参照元: ${sourceLabel} / 取得日時: ${requestedAtText}`);
    }

    detectBrowserName() {
      const ua = navigator.userAgent;
      if (ua.includes("Firefox/")) return "Firefox";
      if (ua.includes("Edg/")) return "Edge";
      if (ua.includes("OPR/")) return "Opera";
      if (ua.includes("Chrome/")) return "Chrome";
      if (ua.includes("Safari/")) return "Safari";
      return "このブラウザ";
    }
  }

  const app = new MigrationApp(CONFIG);
  app.boot();

  function formatPowerLabel(valueInMillions) {
    if (valueInMillions <= 900) {
      return `${valueInMillions.toLocaleString()} M`;
    }

    return `${(valueInMillions / 1000).toFixed(1)} B`;
  }
})();
