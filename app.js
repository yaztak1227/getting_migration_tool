(() => {
  "use strict";

  const CONFIG = {
    cookieName: "lm_migration_cache_v2",
    cacheStorageKey: "lm_migration_cache_store_v1",
    cookieMaxAgeSec: 60 * 60 * 24 * 7,
    cacheValidMs: 24 * 60 * 60 * 1000,
    themeStorageKey: "lm_theme_v1",
    languageStorageKey: "lm_language_v1",
    savedKingdomListsStorageKey: "lm_saved_kingdom_lists_v1",
    defaultPageSize: 50,
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
      {
        id: "sunset",
        label: "Sunset",
        description: "夕焼けの赤橙で華やか、温度感がある",
        $primary: "hsl(14, 76%, 52%)",
      },
      {
        id: "lavender",
        label: "Lavender",
        description: "淡い紫を軸にした柔らかいコントラスト",
        $primary: "hsl(266, 48%, 54%)",
      },
      {
        id: "lagoon",
        label: "Lagoon",
        description: "青緑系で爽やか、少しトロピカル",
        $primary: "hsl(186, 67%, 40%)",
      },
      {
        id: "rosewood",
        label: "Rosewood",
        description: "深い赤紫で落ち着いた高級感",
        $primary: "hsl(338, 47%, 40%)",
      },
    ],
    statusLabelMap: {
      1: "閑散",
      2: "正常",
      3: "混雑",
      4: "過密",
    },
    unknownStatusLabel: "不明",
    listSortLocale: "ja",
    api: {
      url: "/api/migration",
      method: "POST",
      defaults: {
        num: 90,
        status: 0,
        order: 1,
      },
    },
    ocr: {
      languages: "jpn+eng",
      maxFileSizeBytes: 10 * 1024 * 1024,
      candidateMin: 1000,
      candidateMax: 99999,
    },
  };

  const TRANSLATIONS = {
    ja: {
      title: "移民巻物枚数チェック",
      headerTitle: "Lordsmobile 移民王国検索",
      headerInfoButtonAria: "ツール説明",
      headerInfoText:
        "必要パワーごとの移民対象王国一覧を取得し、そのまま検索・絞り込み・ページ表示まで行えます。ローカルの Node.js プロキシ経由で API を取得します。",
      languageLabel: "Language",
      languageSelectAria: "言語選択",
      languageOptionJa: "日本語",
      languageOptionEn: "English",
      themeLabel: "Theme",
      themeSelectAria: "テーマ選択",
      sideMenu: "検索メニュー",
      search: "検索",
      searchPlaceholder: "王国番号・状態・ランクで検索",
      statusFilter: "王国状態",
      statusFilterAria: "王国状態フィルタ",
      statusFilterHelp: "複数選択可。未選択ならすべて表示します。ドロップダウン内でチェックして選べます。",
      statusFilterPlaceholder: "王国状態を選択",
      scrollRange: "必要巻物の範囲",
      minPlaceholder: "最小",
      maxPlaceholder: "最大",
      pageSize: "表示件数",
      pageSizeAria: "表示件数",
      kingdomFilterLabel: "王国番号（範囲 or リスト）",
      kingdomFilterPlaceholder: "例: 1200-1250 または 1201 1203 1207（カンマ/空白/タブ区切り）",
      saveCurrentFilters: "現在の条件を保存",
      saveNamePlaceholder: "保存名 例: 候補A",
      saveFilter: "条件を保存",
      savedListUse: "保存済みリストを使う",
      savedListAria: "保存済み王国番号リスト",
      savedListPlaceholder: "保存済みリストを選択",
      load: "読み込む",
      delete: "削除",
      ocrFromImage: "画像から読み込む",
      ocrNoteHtml:
        '<a href="https://github.com/ogwata/ndlocr-lite-web-ai" target="_blank" rel="noopener noreferrer">ogwata/ndlocr-lite-web-ai</a> のようなブラウザ側OCRの体験を参考に、事前ダウンロード後に画像から王国番号候補を抽出できます。',
      ocrExample: "画像例",
      ocrExampleAlt: "王国番号OCR用の参考画像",
      ocrModel: "OCRモデル",
      ocrDownload: "OCRをダウンロード",
      ocrImage: "OCR画像",
      ocrRun: "OCR実行",
      ocrRunButton: "画像をOCR",
      ocrApply: "王国番号反映",
      ocrApplyButton: "フィルタへ反映",
      ocrInitStatus: "OCRは未準備です。先に「OCRをダウンロード」を押してください。",
      ocrDetectedSummaryFallback: "抽出王国番号: -",
      ocrResultText: "OCR結果テキスト",
      ocrTextPlaceholder: "OCR結果がここに表示されます。",
      resetFilters: "条件をリセット",
      power: "必要パワー",
      powerAria: "必要パワー",
      powerPlaceholder: "例: 3.5B または 3500M",
      powerCandidate: "候補から選択",
      powerCandidateAria: "必要パワー候補",
      powerCandidatePlaceholder: "候補から選択",
      fetch: "取得",
      fetchButton: "取得する",
      refetch: "更新",
      refetchButton: "再取得",
      resultMetaHeading: "取得件数 / 表示状況",
      prevPage: "前へ",
      nextPage: "次へ",
      exportTableImage: "表を画像出力",
      exportTableImageAria: "現在表示している表を画像として保存",
      emptyState: "条件に一致する王国はありません。",
      sortKingdom: "王国番号",
      sortScroll: "必要巻物",
      sortStatus: "王国状態",
      sortRank: "ランク",
      rankTooltipTriggerAria: "ランク0の説明を表示",
      rankTooltip: "0はランク外です",
      perPage: "{size}件ずつ",
      cacheUnused: "キャッシュ未使用",
      runtimeNotice:
        "現在は <strong>file://</strong> で開かれています。{browser} での直接起動は制約が多いため、<strong>http://127.0.0.1:6080</strong> から開くと Node.js のローカルプロキシ経由で取得できます。",
      unknownStatus: "不明",
      unknownError: "不明なエラー",
      unknownDate: "不明",
      browserGeneric: "このブラウザ",
      ocrAlreadyReady: "OCRはすでに利用可能です。画像を選んで実行してください。",
      ocrPreparing: "OCRモデルを準備しています。初回は少し時間がかかります。",
      ocrReady: "OCRの準備が完了しました。画像を選んでOCRできます。",
      ocrTargetImages: "OCR対象画像: {count}枚選択中",
      ocrNeedImage: "OCRする画像を1枚以上選択してください。",
      ocrFileTooLarge: "画像サイズが大きすぎます。10MB以下の画像を選択してください: {name}",
      ocrRunningCount: "OCRを実行しています... ({count}枚)",
      ocrRunningProgress: "OCRを実行しています... ({index}/{total}: {name})",
      ocrDetectedSummary: "抽出王国番号: {candidates}",
      ocrDetectedNone: "抽出王国番号: 見つかりませんでした",
      ocrDetectedDescription:
        "{count}枚のOCR結果から 4〜5桁の数字を候補として抽出し、5桁は末尾4桁へ正規化しました。内容を確認してから反映してください。",
      ocrDetectedDescriptionNone:
        "OCRテキストは取得できましたが、王国番号らしい4〜5桁の候補は見つかりませんでした。",
      ocrDone: "OCRが完了しました。{count}枚分の結果をまとめています。",
      ocrNoCandidates: "反映できる王国番号候補がありません。",
      ocrApplied: "OCRで抽出した王国番号候補をフィルタに反映しました。",
      saveNameRequired: "保存名を入力してください。",
      saveValueRequired: "保存する王国番号リストが空です。",
      savedListSaved: "王国番号リスト「{name}」を保存しました。",
      savedListLoadSelect: "読み込む保存済みリストを選択してください。",
      savedListNotFound: "選択した保存済みリストが見つかりません。",
      savedListLoaded: "王国番号リスト「{name}」を読み込みました。",
      savedListDeleteSelect: "削除する保存済みリストを選択してください。",
      savedListDeleted: "王国番号リスト「{name}」を削除しました。",
      ocrPreparingProgress: "OCRモデル準備中: {status}{percent}",
      ocrProcessingProgress: "OCR実行中: {prefix}{status}{percent}",
      apiLoading: "APIからデータ取得中です...",
      fetchedLatest: "最新データを取得しました。",
      cacheFromApi: "参照元: API / 取得日時: {date}",
      noPowerCache: "この必要パワーのキャッシュはありません。取得するボタンを押してください。",
      invalidPowerInput:
        "必要パワーは {xxx.x}B または {xxxx}M 形式で入力してください（例: 3.5B）。",
      noDisplayData: "表示可能なデータがありません。",
      sortAriaLabel: "{label}を並び替え",
      resultSummary: "取得: {fetched}件 / 絞り込み: {filtered}件 / 表示: {from}-{to}件",
      fileOpenFetchError:
        "{browser} で file:// から開いています。http://127.0.0.1:6080 から開き直してください。",
      fetchFailed: "取得失敗: {message}",
      fileOpenOcrError:
        "{browser} で file:// から開いているため OCR ダウンロードに失敗した可能性があります。http://127.0.0.1:6080 から開き直してください。",
      ocrFailed: "OCR失敗: {message}",
      exportImageNoRows: "出力できる表示データがありません。",
      exportImagePreparing: "表の画像を生成しています...",
      exportImageDone: "現在の表を画像として保存しました。",
      exportImageLibraryMissing:
        "画像出力ライブラリの読み込みに失敗しました。ネットワーク接続を確認して再読み込みしてください。",
      exportImageFailed: "画像出力に失敗: {message}",
      cacheUsed: "キャッシュを利用しました（{date} の取得結果）。",
      statusLabels: {
        1: "閑散",
        2: "正常",
        3: "混雑",
        4: "過密",
      },
      ocrProgressDefaultDownload: "downloading",
      ocrProgressDefaultProcessing: "processing",
    },
    en: {
      title: "Migration Scroll Checker",
      headerTitle: "Lordsmobile Migration Kingdom Search",
      headerInfoButtonAria: "Tool description",
      headerInfoText:
        "Fetch migration target kingdoms by required power, then search, filter, and paginate in one screen. API data is retrieved through the local Node.js proxy.",
      languageLabel: "Language",
      languageSelectAria: "Language selector",
      languageOptionJa: "Japanese",
      languageOptionEn: "English",
      themeLabel: "Theme",
      themeSelectAria: "Theme selector",
      sideMenu: "Search Menu",
      search: "Search",
      searchPlaceholder: "Search by kingdom, status, or rank",
      statusFilter: "Kingdom Status",
      statusFilterAria: "Kingdom status filter",
      statusFilterHelp: "Multiple selection is available. If none are selected, all statuses are shown. Check statuses in the dropdown.",
      statusFilterPlaceholder: "Select kingdom status",
      scrollRange: "Scroll Range",
      minPlaceholder: "Min",
      maxPlaceholder: "Max",
      pageSize: "Rows",
      pageSizeAria: "Rows per page",
      kingdomFilterLabel: "Kingdom IDs (Range or List)",
      kingdomFilterPlaceholder: "Example: 1200-1250 or 1201 1203 1207 (comma/space/tab separated)",
      saveCurrentFilters: "Save Current Filter",
      saveNamePlaceholder: "Name e.g. Candidate A",
      saveFilter: "Save Filter",
      savedListUse: "Use Saved List",
      savedListAria: "Saved kingdom list",
      savedListPlaceholder: "Select a saved list",
      load: "Load",
      delete: "Delete",
      ocrFromImage: "Load from Image",
      ocrNoteHtml:
        'Inspired by browser OCR experiences such as <a href="https://github.com/ogwata/ndlocr-lite-web-ai" target="_blank" rel="noopener noreferrer">ogwata/ndlocr-lite-web-ai</a>, this tool can extract kingdom candidates after pre-downloading OCR resources.',
      ocrExample: "Example Image",
      ocrExampleAlt: "Reference image for kingdom OCR",
      ocrModel: "OCR Model",
      ocrDownload: "Download OCR",
      ocrImage: "OCR Images",
      ocrRun: "Run OCR",
      ocrRunButton: "Run OCR on Images",
      ocrApply: "Apply IDs",
      ocrApplyButton: "Apply to Filter",
      ocrInitStatus: "OCR is not ready. Click \"Download OCR\" first.",
      ocrDetectedSummaryFallback: "Detected Kingdom IDs: -",
      ocrResultText: "OCR Result Text",
      ocrTextPlaceholder: "OCR result text appears here.",
      resetFilters: "Reset Filters",
      power: "Required Power",
      powerAria: "Required power",
      powerPlaceholder: "Example: 3.5B or 3500M",
      powerCandidate: "Select from candidates",
      powerCandidateAria: "Required power candidates",
      powerCandidatePlaceholder: "Select from candidates",
      fetch: "Fetch",
      fetchButton: "Fetch Data",
      refetch: "Refresh",
      refetchButton: "Refetch",
      resultMetaHeading: "Fetched / Filtered / Display",
      prevPage: "Prev",
      nextPage: "Next",
      exportTableImage: "Export Table Image",
      exportTableImageAria: "Save the currently displayed table as an image",
      emptyState: "No kingdoms match the current filters.",
      sortKingdom: "Kingdom ID",
      sortScroll: "Required Scrolls",
      sortStatus: "Status",
      sortRank: "Rank",
      rankTooltipTriggerAria: "Show rank 0 description",
      rankTooltip: "0 means out of rank",
      perPage: "{size} / page",
      cacheUnused: "Cache not used",
      runtimeNotice:
        "You are currently opening this app via <strong>file://</strong>. Direct launch in {browser} has restrictions, so open from <strong>http://127.0.0.1:6080</strong> to fetch data through the local Node.js proxy.",
      unknownStatus: "Unknown",
      unknownError: "Unknown error",
      unknownDate: "Unknown",
      browserGeneric: "this browser",
      ocrAlreadyReady: "OCR is already ready. Select images and run OCR.",
      ocrPreparing: "Preparing OCR model. The first run may take a while.",
      ocrReady: "OCR is ready. Select images to run OCR.",
      ocrTargetImages: "OCR target images: {count} selected",
      ocrNeedImage: "Select at least one image to run OCR.",
      ocrFileTooLarge: "Image is too large. Select an image under 10MB: {name}",
      ocrRunningCount: "Running OCR... ({count} images)",
      ocrRunningProgress: "Running OCR... ({index}/{total}: {name})",
      ocrDetectedSummary: "Detected Kingdom IDs: {candidates}",
      ocrDetectedNone: "Detected Kingdom IDs: none",
      ocrDetectedDescription:
        "Extracted 4-5 digit number candidates from {count} OCR result images, and normalized 5-digit values to the last 4 digits. Verify before applying.",
      ocrDetectedDescriptionNone:
        "OCR text was extracted, but no 4-5 digit kingdom-like candidates were found.",
      ocrDone: "OCR complete. Aggregated results from {count} images.",
      ocrNoCandidates: "No kingdom candidates are available to apply.",
      ocrApplied: "Applied OCR-detected kingdom candidates to the filter.",
      saveNameRequired: "Enter a name to save.",
      saveValueRequired: "The kingdom list to save is empty.",
      savedListSaved: "Saved kingdom list \"{name}\".",
      savedListLoadSelect: "Select a saved list to load.",
      savedListNotFound: "The selected saved list was not found.",
      savedListLoaded: "Loaded kingdom list \"{name}\".",
      savedListDeleteSelect: "Select a saved list to delete.",
      savedListDeleted: "Deleted kingdom list \"{name}\".",
      ocrPreparingProgress: "Preparing OCR model: {status}{percent}",
      ocrProcessingProgress: "OCR in progress: {prefix}{status}{percent}",
      apiLoading: "Fetching data from API...",
      fetchedLatest: "Fetched latest data.",
      cacheFromApi: "Source: API / Fetched at: {date}",
      noPowerCache: "No cache exists for this power. Click fetch.",
      invalidPowerInput: "Enter power as {xxx.x}B or {xxxx}M (example: 3.5B).",
      noDisplayData: "No displayable data is available.",
      sortAriaLabel: "Sort by {label}",
      resultSummary: "Fetched: {fetched} / Filtered: {filtered} / Display: {from}-{to}",
      fileOpenFetchError:
        "Opened with file:// in {browser}. Reopen from http://127.0.0.1:6080.",
      fetchFailed: "Fetch failed: {message}",
      fileOpenOcrError:
        "Because this page is opened via file:// in {browser}, OCR download may fail. Reopen from http://127.0.0.1:6080.",
      ocrFailed: "OCR failed: {message}",
      exportImageNoRows: "There is no visible table data to export.",
      exportImagePreparing: "Preparing table image...",
      exportImageDone: "Saved the currently displayed table as an image.",
      exportImageLibraryMissing:
        "Image export library failed to load. Check your network and reload this page.",
      exportImageFailed: "Image export failed: {message}",
      cacheUsed: "Used cache (fetched at {date}).",
      statusLabels: {
        1: "Quiet",
        2: "Normal",
        3: "Busy",
        4: "Crowded",
      },
      ocrProgressDefaultDownload: "downloading",
      ocrProgressDefaultProcessing: "processing",
    },
  };

  const LOCALE_FILES = [
    { code: "en", file: "en.json", label: "English" },
    { code: "ja", file: "ja.json", label: "日本語" },
    { code: "ko", file: "ko.json", label: "한국어" },
    { code: "zh-CN", file: "zh-CN.json", label: "简体中文" },
    { code: "zh-TW", file: "zh-TW.json", label: "繁體中文" },
    { code: "fr", file: "fr.json", label: "Français" },
    { code: "de", file: "de.json", label: "Deutsch" },
    { code: "es", file: "es.json", label: "Español" },
    { code: "it", file: "it.json", label: "Italiano" },
    { code: "pt", file: "pt.json", label: "Português" },
    { code: "ru", file: "ru.json", label: "Русский" },
    { code: "ar", file: "ar.json", label: "العربية" },
    { code: "tr", file: "tr.json", label: "Türkçe" },
    { code: "th", file: "th.json", label: "ไทย" },
    { code: "vi", file: "vi.json", label: "Tiếng Việt" },
    { code: "id", file: "id.json", label: "Bahasa Indonesia" },
    { code: "ms", file: "ms.json", label: "Bahasa Melayu" },
    { code: "pl", file: "pl.json", label: "Polski" },
    { code: "uk", file: "uk.json", label: "Українська" },
  ];

  class I18nManager {
    constructor(config, dom) {
      this.config = config;
      this.dom = dom;
      this.lang = "ja";
      this.onChange = null;
      this.translations = { ...TRANSLATIONS };
      this.supportedLanguages = LOCALE_FILES.map((item) => item.code);
      this.localeMeta = new Map(LOCALE_FILES.map((item) => [item.code, item]));
      this.loadedLanguages = new Set(["ja", "en"]);
      this.loadingPromises = new Map();
    }

    init(onChange) {
      this.onChange = typeof onChange === "function" ? onChange : null;
      this.initLanguageOptions();
      const initial = this.readLanguage();
      this.setLanguage(initial);
      this.dom.languageSelect.addEventListener("change", () => this.setLanguage(this.dom.languageSelect.value));
    }

    initLanguageOptions() {
      this.dom.languageSelect.innerHTML = "";
      for (const item of LOCALE_FILES) {
        const option = document.createElement("option");
        option.value = item.code;
        option.textContent = this.languageLabel(item.code);
        this.dom.languageSelect.appendChild(option);
      }
    }

    readLanguage() {
      const saved = this.normalizeLanguageCode(window.localStorage.getItem(this.config.languageStorageKey));
      if (saved) return saved;
      const browserLang = String(navigator.language || "").toLowerCase();
      if (browserLang.startsWith("ja")) return "ja";
      if (browserLang.startsWith("zh")) return "zh-CN";
      return "en";
    }

    setLanguage(lang) {
      this.lang = this.normalizeLanguageCode(lang) || "en";
      this.applyLanguageToDocument();
      this.dom.languageSelect.value = this.lang;
      window.localStorage.setItem(this.config.languageStorageKey, this.lang);
      this.initLanguageOptions();
      this.dom.languageSelect.value = this.lang;
      if (this.onChange) this.onChange(this.lang);
      if (this.loadedLanguages.has(this.lang)) return;
      this.ensureLanguageLoaded(this.lang).then((loaded) => {
        if (!loaded || this.lang !== loaded) return;
        this.applyLanguageToDocument();
        this.initLanguageOptions();
        this.dom.languageSelect.value = this.lang;
        if (this.onChange) this.onChange(this.lang);
      });
    }

    currentLanguage() {
      return this.lang;
    }

    statusLabelMap() {
      return this.dictionary().statusLabels || TRANSLATIONS.en.statusLabels;
    }

    t(key, vars = {}, langOverride = null) {
      const lang = langOverride || this.lang;
      const dict = this.dictionary(lang);
      const fallback = this.dictionary("en");
      const template = key in dict ? dict[key] : fallback[key];
      if (typeof template !== "string") return "";
      return this.format(template, vars);
    }

    applyStaticTexts() {
      document.title = this.t("title");
      this.setText(".header-left .title", "headerTitle");
      this.setAttr("#headerInfoButton", "aria-label", "headerInfoButtonAria");
      this.setHtml(".tooltip-card", "headerInfoText");
      this.setText("#languageLabel", "languageLabel");
      this.setAttr("#languageSelect", "aria-label", "languageSelectAria");
      this.setText("#themeLabel", "themeLabel");
      this.setAttr("#themeSelect", "aria-label", "themeSelectAria");
      this.setText(".side-drawer-toggle", "sideMenu");
      this.setText("label[for='searchInput']", "search");
      this.setAttr("#searchInput", "placeholder", "searchPlaceholder");
      this.setText("label[for='statusFilter']", "statusFilter");
      this.setAttr("#statusFilter", "aria-label", "statusFilterAria");
      this.setText(".status-filter-select + .help", "statusFilterHelp");
      this.setText(".field > .label:not([for])", "scrollRange");
      this.setAttr("#scrollMinInput", "placeholder", "minPlaceholder");
      this.setAttr("#scrollMaxInput", "placeholder", "maxPlaceholder");
      this.setText("label[for='pageSizeSelect']", "pageSize");
      this.setAttr("#pageSizeSelect", "aria-label", "pageSizeAria");
      this.setText("label[for='kingdomRangeListInput']", "kingdomFilterLabel");
      this.setAttr("#kingdomRangeListInput", "placeholder", "kingdomFilterPlaceholder");
      this.setText(".saved-kingdom-block .saved-kingdom-title", "saveCurrentFilters");
      this.setAttr("#kingdomListNameInput", "placeholder", "saveNamePlaceholder");
      this.setText("#saveKingdomListButton", "saveFilter");
      this.setText(".saved-kingdom-block.mt-3 .saved-kingdom-title", "savedListUse");
      this.setAttr("#savedKingdomListSelect", "aria-label", "savedListAria");
      this.setText("#loadKingdomListButton", "load");
      this.setText("#deleteKingdomListButton", "delete");
      this.setText(".ocr-details-title", "ocrFromImage");
      this.setHtml(".ocr-panel-note", "ocrNoteHtml");
      this.setText(".ocr-example-trigger", "ocrExample");
      this.setAttr(".ocr-example-image", "alt", "ocrExampleAlt");
      this.setText("label[for='ocrPrepareButton']", "ocrModel");
      this.setText("#ocrPrepareButton", "ocrDownload");
      this.setText("label[for='ocrImageInput']", "ocrImage");
      this.setText("label[for='ocrRunButton']", "ocrRun");
      this.setText("#ocrRunButton", "ocrRunButton");
      this.setText("label[for='ocrApplyButton']", "ocrApply");
      this.setText("#ocrApplyButton", "ocrApplyButton");
      this.setText("#ocrStatus .message-body", "ocrInitStatus");
      this.setText("#ocrDetectedSummary", "ocrDetectedSummaryFallback");
      this.setText("label[for='ocrTextOutput']", "ocrResultText");
      this.setAttr("#ocrTextOutput", "placeholder", "ocrTextPlaceholder");
      this.setText("#resetFiltersButton", "resetFilters");
      this.setText("label[for='powerSelect']", "power");
      this.setAttr("#powerSelect", "aria-label", "powerAria");
      this.setAttr("#powerSelect", "placeholder", "powerPlaceholder");
      this.setText("label[for='powerCandidateSelect']", "powerCandidate");
      this.setAttr("#powerCandidateSelect", "aria-label", "powerCandidateAria");
      this.setText("label[for='fetchButton']", "fetch");
      this.setText("#fetchButton", "fetchButton");
      this.setText("label[for='refetchButton']", "refetch");
      this.setText("#refetchButton", "refetchButton");
      this.setText("#resultMetaHeading", "resultMetaHeading");
      this.setText("#prevPageButton", "prevPage");
      this.setText("#nextPageButton", "nextPage");
      this.setText("#exportTableImageButton", "exportTableImage");
      this.setAttr("#exportTableImageButton", "aria-label", "exportTableImageAria");
      this.setText("#emptyState .message-body", "emptyState");
      this.setText("#sortKingdomLabel", "sortKingdom");
      this.setText("#sortScrollLabel", "sortScroll");
      this.setText("#sortStatusLabel", "sortStatus");
      this.setText("#sortRankLabel", "sortRank");
      this.setAttr(".header-tooltip-trigger", "aria-label", "rankTooltipTriggerAria");
      this.setText("#rankZeroTooltip", "rankTooltip");
    }

    formatDateTime(isoLike) {
      const date = new Date(isoLike);
      if (Number.isNaN(date.getTime())) return this.t("unknownDate");
      const locale = this.lang === "en" ? "en-US" : this.lang;
      return date.toLocaleString(locale, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    }

    dictionary(lang = this.lang) {
      return this.translations[lang] || this.translations.en || TRANSLATIONS.en;
    }

    languageLabel(code) {
      const meta = this.localeMeta.get(code);
      if (!meta) return code;
      return meta.label || code;
    }

    normalizeLanguageCode(value) {
      const raw = String(value || "").trim();
      if (!raw) return "";
      const lower = raw.toLowerCase();
      for (const code of this.supportedLanguages) {
        if (code.toLowerCase() === lower) return code;
      }
      if (lower.startsWith("zh-hant")) return "zh-TW";
      if (lower.startsWith("zh")) return "zh-CN";
      const short = lower.split("-")[0];
      for (const code of this.supportedLanguages) {
        if (code.toLowerCase() === short) return code;
      }
      return "";
    }

    applyLanguageToDocument() {
      this.dom.themeRoot.lang = this.lang;
      this.dom.themeRoot.dir = this.lang === "ar" ? "rtl" : "ltr";
    }

    async ensureLanguageLoaded(lang) {
      const normalized = this.normalizeLanguageCode(lang);
      if (!normalized) return "";
      if (this.loadedLanguages.has(normalized)) return normalized;
      if (this.loadingPromises.has(normalized)) return this.loadingPromises.get(normalized);

      const promise = this.loadLanguageFile(normalized)
        .catch((error) => {
          console.warn(`failed to load locale file for ${normalized}`, error);
          return normalized;
        })
        .finally(() => {
          this.loadingPromises.delete(normalized);
        });
      this.loadingPromises.set(normalized, promise);
      return promise;
    }

    async loadLanguageFile(lang) {
      const meta = this.localeMeta.get(lang);
      if (!meta) return lang;
      const response = await window.fetch(`./locales/${meta.file}`, { cache: "no-cache" });
      if (!response.ok) throw new Error(`locale fetch failed (${response.status})`);
      const payload = await response.json();

      const base = this.dictionary("en");
      const external =
        payload && payload.translations && typeof payload.translations === "object"
          ? payload.translations
          : {};
      this.translations[lang] = this.mergeDictionary(base, external);
      this.loadedLanguages.add(lang);
      return lang;
    }

    mergeDictionary(base, override) {
      const merged = { ...base, ...override };
      const baseStatus = base && typeof base.statusLabels === "object" ? base.statusLabels : {};
      const overrideStatus =
        override && typeof override.statusLabels === "object" ? override.statusLabels : {};
      merged.statusLabels = { ...baseStatus, ...overrideStatus };
      return merged;
    }

    format(template, vars) {
      return String(template).replace(/\{(\w+)\}/g, (_, key) =>
        Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : `{${key}}`
      );
    }

    setText(selector, key) {
      const element = document.querySelector(selector);
      if (!element) return;
      element.textContent = this.t(key);
    }

    setHtml(selector, key) {
      const element = document.querySelector(selector);
      if (!element) return;
      element.innerHTML = this.t(key);
    }

    setAttr(selector, attr, key) {
      const element = document.querySelector(selector);
      if (!element) return;
      element.setAttribute(attr, this.t(key));
    }
  }

  class DomRefs {
    constructor() {
      this.themeRoot = document.documentElement;
      this.languageSelect = document.getElementById("languageSelect");
      this.themeSelect = document.getElementById("themeSelect");
      this.powerSelect = document.getElementById("powerSelect");
      this.powerCandidateSelect = document.getElementById("powerCandidateSelect");
      this.fetchButton = document.getElementById("fetchButton");
      this.refetchButton = document.getElementById("refetchButton");
      this.status = document.getElementById("status");
      this.statusBody = this.status.querySelector(".message-body");
      this.runtimeNotice = document.getElementById("runtimeNotice");
      this.runtimeNoticeBody = this.runtimeNotice.querySelector(".message-body");
      this.ocrPrepareButton = document.getElementById("ocrPrepareButton");
      this.ocrDetails = document.getElementById("ocrDetails");
      this.ocrImageInput = document.getElementById("ocrImageInput");
      this.ocrRunButton = document.getElementById("ocrRunButton");
      this.ocrApplyButton = document.getElementById("ocrApplyButton");
      this.ocrStatus = document.getElementById("ocrStatus");
      this.ocrStatusBody = this.ocrStatus.querySelector(".message-body");
      this.ocrResultPanel = document.getElementById("ocrResultPanel");
      this.ocrDetectedSummary = document.getElementById("ocrDetectedSummary");
      this.ocrDetectedList = document.getElementById("ocrDetectedList");
      this.ocrTextOutput = document.getElementById("ocrTextOutput");
      this.filterPanel = document.getElementById("filterPanel");
      this.searchInput = document.getElementById("searchInput");
      this.statusFilter = document.getElementById("statusFilter");
      this.pageSizeSelect = document.getElementById("pageSizeSelect");
      this.resetFiltersButton = document.getElementById("resetFiltersButton");
      this.kingdomRangeListInput = document.getElementById("kingdomRangeListInput");
      this.kingdomListNameInput = document.getElementById("kingdomListNameInput");
      this.savedKingdomListSelect = document.getElementById("savedKingdomListSelect");
      this.saveKingdomListButton = document.getElementById("saveKingdomListButton");
      this.loadKingdomListButton = document.getElementById("loadKingdomListButton");
      this.deleteKingdomListButton = document.getElementById("deleteKingdomListButton");
      this.scrollMinInput = document.getElementById("scrollMinInput");
      this.scrollMaxInput = document.getElementById("scrollMaxInput");
      this.resultMeta = document.getElementById("resultMeta");
      this.filteredCount = document.getElementById("filteredCount");
      this.prevPageButton = document.getElementById("prevPageButton");
      this.nextPageButton = document.getElementById("nextPageButton");
      this.exportTableImageButton = document.getElementById("exportTableImageButton");
      this.pageIndicator = document.getElementById("pageIndicator");
      this.emptyState = document.getElementById("emptyState");
      this.resultTable = document.getElementById("resultTable");
      this.resultBody = document.getElementById("resultBody");
      this.cacheInfo = document.getElementById("cacheInfo");
      this.sortButtons = [...document.querySelectorAll(".sort-button[data-sort-key]")];
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
      this.applyThemeSelectPalette(theme.$primary);
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

    applyThemeSelectPalette(primaryHsl) {
      const parsed = this.parseHsl(primaryHsl) || this.parseHsl(this.config.themes[0].$primary);
      if (!parsed) return;

      const accentLightness = this.clamp(parsed.l - 10, 24, 44);
      const softLightness = this.clamp(parsed.l + 34, 84, 96);
      const borderLightness = this.clamp(parsed.l + 12, 52, 74);
      const accent = `hsl(${parsed.h}deg ${parsed.s}% ${accentLightness}%)`;
      const soft = `hsl(${parsed.h}deg ${Math.max(parsed.s - 10, 18)}% ${softLightness}%)`;
      const border = `hsl(${parsed.h}deg ${Math.max(parsed.s - 4, 20)}% ${borderLightness}%)`;

      this.dom.themeRoot.style.setProperty("--theme-select-accent", accent);
      this.dom.themeRoot.style.setProperty("--theme-select-soft", soft);
      this.dom.themeRoot.style.setProperty("--theme-select-border", border);
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

  class SavedKingdomListStore {
    constructor(config) {
      this.config = config;
    }

    readAll() {
      const raw = window.localStorage.getItem(this.config.savedKingdomListsStorageKey);
      if (!raw) return [];
      try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed
          .filter((item) => item && typeof item === "object")
          .map((item) => ({
            name: String(item.name || "").trim(),
            value: String(item.value || "").trim(),
            updatedAt: String(item.updatedAt || ""),
          }))
          .filter((item) => item.name && item.value)
          .sort((a, b) => a.name.localeCompare(b.name, this.config.listSortLocale));
      } catch (error) {
        console.warn("saved kingdom list parse error", error);
        return [];
      }
    }

    writeAll(items) {
      window.localStorage.setItem(this.config.savedKingdomListsStorageKey, JSON.stringify(items));
    }

    save(name, value) {
      const items = this.readAll().filter((item) => item.name !== name);
      items.push({
        name,
        value,
        updatedAt: new Date().toISOString(),
      });
      this.writeAll(items);
    }

    remove(name) {
      const items = this.readAll().filter((item) => item.name !== name);
      this.writeAll(items);
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
        throw new Error("axios failed to load. Please check your network connection.");
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
        throw new Error(response.msg || `API error (code=${response.code})`);
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

  class OcrManager {
    constructor(config) {
      this.config = config;
      this.worker = null;
      this.preparePromise = null;
      this.progressHandler = null;
    }

    async prepare(onProgress) {
      if (this.worker) {
        if (typeof onProgress === "function") {
          onProgress({
            status: "ready",
            progress: 1,
          });
        }
        return this.worker;
      }

      if (this.preparePromise) {
        this.progressHandler = onProgress;
        return this.preparePromise;
      }

      if (!window.Tesseract || typeof window.Tesseract.createWorker !== "function") {
        throw new Error("Tesseract.js failed to load.");
      }

      this.progressHandler = onProgress;
      this.preparePromise = (async () => {
        const worker = await window.Tesseract.createWorker(this.config.ocr.languages, 1, {
          logger: (message) => {
            if (typeof this.progressHandler === "function") {
              this.progressHandler(message);
            }
          },
        });

        if (window.Tesseract.PSM) {
          await worker.setParameters({
            tessedit_pageseg_mode: window.Tesseract.PSM.AUTO,
            preserve_interword_spaces: "1",
          });
        }

        this.worker = worker;
        return worker;
      })();

      try {
        return await this.preparePromise;
      } finally {
        this.preparePromise = null;
      }
    }

    async recognize(file, onProgress) {
      const worker = await this.prepare(onProgress);
      this.progressHandler = onProgress;
      const result = await worker.recognize(file);
      return result && result.data ? result.data : { text: "" };
    }
  }

  class KingdomFilter {
    constructor(config) {
      this.config = config;
    }

    createDefaultFilters() {
      return {
        query: "",
        statuses: [],
        kingdomRangeList: "",
        scrollMin: "",
        scrollMax: "",
        pageSize: this.defaultPageSize(),
      };
    }

    defaultPageSize() {
      if (this.config.pageSizeOptions.includes(this.config.defaultPageSize)) {
        return this.config.defaultPageSize;
      }
      return this.config.pageSizeOptions[0];
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

      const selectedStatuses = this.normalizeStatusValues(filters.statuses);
      if (selectedStatuses.length > 0) {
        const selectedSet = new Set(selectedStatuses);
        rows = rows.filter((row) => selectedSet.has(row.status));
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
      return this.config.statusLabelMap[value] || this.config.unknownStatusLabel;
    }

    normalizePageSize(value) {
      const size = Number(value);
      return this.config.pageSizeOptions.includes(size) ? size : this.defaultPageSize();
    }

    normalizeStatusValues(values) {
      if (!Array.isArray(values)) return [];
      return [...new Set(values.map((value) => Number(value)).filter((value) => Number.isFinite(value)))].sort(
        (a, b) => a - b
      );
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
      this.i18n = new I18nManager(config, this.dom);
      this.themeManager = new ThemeManager(config, this.dom);
      this.cacheStore = new CacheStore(config);
      this.savedKingdomLists = new SavedKingdomListStore(config);
      this.api = new MigrationApi(config);
      this.ocr = new OcrManager(config);
      this.filter = new KingdomFilter(config);
      this.state = {
        kingdomList: [],
        filteredList: [],
        currentPage: 1,
        filters: this.filter.createDefaultFilters(),
        sort: {
          key: null,
          direction: "asc",
        },
        ocrReady: false,
        ocrPreparing: false,
        ocrRunning: false,
        currentDataPower: null,
        ocrCandidateKingdoms: [],
        exportingImage: false,
        statusFilterUiReady: false,
        syncingStatusFilterUi: false,
      };
    }

    boot() {
      this.i18n.init(() => this.handleLanguageChange());
      this.themeManager.init();
      this.initPowerOptions();
      this.initFilterOptions();
      this.initStatusFilterUi();
      this.renderSavedKingdomLists();
      this.bindEvents();
      this.setCacheInfo(this.t("cacheUnused"));
      this.renderRuntimeNotice();
      this.updateOcrControls();
      this.restoreFromCacheOnLoad();
    }

    t(key, vars = {}) {
      return this.i18n.t(key, vars);
    }

    handleLanguageChange() {
      this.config.statusLabelMap = this.i18n.statusLabelMap();
      this.config.unknownStatusLabel = this.t("unknownStatus");
      this.config.listSortLocale = this.i18n.currentLanguage();
      this.i18n.applyStaticTexts();
      this.initPowerOptions();
      this.initFilterOptions();
      this.initStatusFilterUi();
      this.renderSavedKingdomLists(this.dom.savedKingdomListSelect.value);
      if (this.state.kingdomList.length > 0) {
        this.rerender();
      } else {
        this.setCacheInfo(this.t("cacheUnused"));
        this.dom.filteredCount.textContent = this.t("resultSummary", {
          fetched: "0",
          filtered: "0",
          from: "0",
          to: "0",
        });
      }
      this.renderRuntimeNotice();
    }

    initPowerOptions() {
      this.refreshPowerOptions();
      if (!this.dom.powerSelect.value.trim()) {
        this.dom.powerSelect.value = formatPowerInputValue(100);
      }
    }

    refreshPowerOptions() {
      if (!this.dom.powerCandidateSelect) return;
      this.dom.powerCandidateSelect.innerHTML = "";
      const fragment = document.createDocumentFragment();
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = this.t("powerCandidatePlaceholder");
      fragment.appendChild(placeholder);

      const values = new Set();
      for (let value = 100; value <= 3000; value += 100) values.add(value);
      for (const value of this.readCachedPowerValues()) values.add(value);
      const sortedValues = [...values].sort((a, b) => a - b);

      for (const value of sortedValues) {
        const option = document.createElement("option");
        option.value = formatPowerInputValue(value);
        option.textContent = formatPowerLabel(value);
        fragment.appendChild(option);
      }
      this.dom.powerCandidateSelect.appendChild(fragment);
      this.dom.powerCandidateSelect.value = "";
    }

    readCachedPowerValues() {
      const values = [];
      const store = this.cacheStore.readStore();
      for (const key of Object.keys(store.items || {})) {
        const value = Number(key);
        if (!Number.isFinite(value) || value <= 0) continue;
        values.push(value);
      }

      const legacy = this.cacheStore.readLegacyCookie();
      const legacyPower = Number(legacy && legacy.requestPlan ? legacy.requestPlan.power : "");
      if (Number.isFinite(legacyPower) && legacyPower > 0) values.push(legacyPower);

      return [...new Set(values)];
    }

    initFilterOptions() {
      this.dom.statusFilter.innerHTML = "";
      this.dom.pageSizeSelect.innerHTML = "";

      const statusFragment = document.createDocumentFragment();
      for (const [value, label] of Object.entries(this.config.statusLabelMap)) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = label;
        statusFragment.appendChild(option);
      }

      const pageSizeFragment = document.createDocumentFragment();
      for (const size of this.config.pageSizeOptions) {
        const option = document.createElement("option");
        option.value = String(size);
        option.textContent = this.t("perPage", { size });
        pageSizeFragment.appendChild(option);
      }

      this.dom.statusFilter.appendChild(statusFragment);
      this.dom.pageSizeSelect.appendChild(pageSizeFragment);
      this.applyFiltersToUI();
    }

    initStatusFilterUi() {
      if (!window.jQuery || typeof window.jQuery.fn.multipleSelect !== "function") {
        this.state.statusFilterUiReady = false;
        return;
      }

      if (this.state.statusFilterUiReady) {
        window.jQuery(this.dom.statusFilter).multipleSelect("destroy");
        this.state.statusFilterUiReady = false;
      }

      window.jQuery(this.dom.statusFilter).multipleSelect({
        selectAll: false,
        filter: true,
        width: "100%",
        placeholder: this.t("statusFilterPlaceholder"),
        minimumCountSelected: 4,
        displayDelimiter: " / ",
        ellipsis: true,
        onClick: () => this.handleStatusFilterPluginChange(),
        onCheckAll: () => this.handleStatusFilterPluginChange(),
        onUncheckAll: () => this.handleStatusFilterPluginChange(),
        onClear: () => this.handleStatusFilterPluginChange(),
      });
      this.state.statusFilterUiReady = true;
      this.syncStatusFilterUi();
    }

    bindEvents() {
      this.dom.fetchButton.addEventListener("click", () => this.handleFetch(false));
      this.dom.refetchButton.addEventListener("click", () => this.handleFetch(true));
      this.dom.powerSelect.addEventListener("change", () => this.handlePowerChange());
      this.dom.powerCandidateSelect.addEventListener("change", () => this.handlePowerCandidateSelect());
      this.dom.searchInput.addEventListener("input", () => this.handleFilterInput());
      this.dom.statusFilter.addEventListener("change", () => this.handleFilterInput());
      this.dom.pageSizeSelect.addEventListener("change", () => this.handlePageSizeChange());
      this.dom.kingdomRangeListInput.addEventListener("input", () => this.handleFilterInput());
      this.dom.saveKingdomListButton.addEventListener("click", () => this.handleSaveKingdomList());
      this.dom.loadKingdomListButton.addEventListener("click", () => this.handleLoadKingdomList());
      this.dom.deleteKingdomListButton.addEventListener("click", () => this.handleDeleteKingdomList());
      this.dom.savedKingdomListSelect.addEventListener("change", () => this.handleSavedKingdomSelectionChange());
      this.dom.scrollMinInput.addEventListener("input", () => this.handleFilterInput());
      this.dom.scrollMaxInput.addEventListener("input", () => this.handleFilterInput());
      this.dom.ocrPrepareButton.addEventListener("click", () => this.handlePrepareOcr());
      this.dom.ocrImageInput.addEventListener("change", () => this.handleOcrFileChange());
      this.dom.ocrRunButton.addEventListener("click", () => this.handleRunOcr());
      this.dom.ocrApplyButton.addEventListener("click", () => this.applyOcrCandidatesToFilter());
      this.dom.resetFiltersButton.addEventListener("click", () => this.resetFilters());
      this.dom.prevPageButton.addEventListener("click", () => this.movePage(-1));
      this.dom.nextPageButton.addEventListener("click", () => this.movePage(1));
      this.dom.exportTableImageButton.addEventListener("click", () => this.handleExportTableImage());
      for (const button of this.dom.sortButtons) {
        button.addEventListener("click", () => this.handleSortChange(button.dataset.sortKey || ""));
      }
    }

    renderRuntimeNotice() {
      if (window.location.protocol !== "file:") {
        this.dom.runtimeNotice.hidden = true;
        return;
      }

      const browserName = this.detectBrowserName();
      this.dom.runtimeNotice.hidden = false;
      this.dom.runtimeNoticeBody.innerHTML = this.t("runtimeNotice", {
        browser: this.escapeHtml(browserName),
      });
    }

    async handlePrepareOcr() {
      if (this.state.ocrPreparing || this.state.ocrReady) {
        if (this.state.ocrReady) {
          this.setOcrStatus(this.t("ocrAlreadyReady"));
        }
        return;
      }

      this.state.ocrPreparing = true;
      this.updateOcrControls();
      this.setOcrStatus(this.t("ocrPreparing"));

      try {
        await this.ocr.prepare((message) => this.renderOcrProgress(message, "download"));
        this.state.ocrReady = true;
        this.setOcrStatus(this.t("ocrReady"));
      } catch (error) {
        console.error(error);
        this.setOcrStatus(this.buildOcrErrorMessage(error), true);
      } finally {
        this.state.ocrPreparing = false;
        this.updateOcrControls();
      }
    }

    handleOcrFileChange() {
      const files = this.getSelectedOcrFiles();
      if (files.length > 0) {
        this.dom.ocrDetails.open = true;
        this.setOcrStatus(this.t("ocrTargetImages", { count: files.length }));
      }
      this.updateOcrControls();
    }

    async handleRunOcr() {
      const files = this.getSelectedOcrFiles();
      if (files.length === 0) {
        this.setOcrStatus(this.t("ocrNeedImage"), true);
        return;
      }

      for (const file of files) {
        if (file.size > this.config.ocr.maxFileSizeBytes) {
          this.setOcrStatus(this.t("ocrFileTooLarge", { name: file.name }), true);
          return;
        }
      }

      this.state.ocrRunning = true;
      this.updateOcrControls();
      this.setOcrStatus(this.t("ocrRunningCount", { count: files.length }));

      try {
        const allTexts = [];
        const candidateSet = new Set();

        for (let index = 0; index < files.length; index += 1) {
          const file = files[index];
          this.setOcrStatus(
            this.t("ocrRunningProgress", {
              index: index + 1,
              total: files.length,
              name: file.name,
            })
          );
          const result = await this.ocr.recognize(file, (message) =>
            this.renderOcrProgress(message, "recognize", {
              current: index + 1,
              total: files.length,
              fileName: file.name,
            })
          );
          const text = String(result.text || "").trim();
          if (text) {
            allTexts.push(`--- ${file.name} ---\n${text}`);
          } else {
            allTexts.push(`--- ${file.name} ---\n`);
          }

          const candidates = this.extractKingdomCandidates(text);
          for (const candidate of candidates) {
            candidateSet.add(candidate);
          }
        }

        const mergedText = allTexts.join("\n\n").trim();
        const candidates = [...candidateSet].sort((a, b) => a - b);
        this.state.ocrCandidateKingdoms = candidates;
        this.dom.ocrDetails.open = true;
        this.dom.ocrResultPanel.hidden = false;
        this.dom.ocrTextOutput.value = mergedText;
        this.dom.ocrDetectedSummary.textContent =
          candidates.length > 0
            ? this.t("ocrDetectedSummary", { candidates: candidates.join(", ") })
            : this.t("ocrDetectedNone");
        this.dom.ocrDetectedList.textContent =
          candidates.length > 0
            ? this.t("ocrDetectedDescription", { count: files.length })
            : this.t("ocrDetectedDescriptionNone");
        this.setOcrStatus(this.t("ocrDone", { count: files.length }));
      } catch (error) {
        console.error(error);
        this.setOcrStatus(this.buildOcrErrorMessage(error), true);
      } finally {
        this.state.ocrRunning = false;
        this.updateOcrControls();
      }
    }

    applyOcrCandidatesToFilter() {
      if (this.state.ocrCandidateKingdoms.length === 0) {
        this.setOcrStatus(this.t("ocrNoCandidates"), true);
        return;
      }

      this.dom.kingdomRangeListInput.value = this.state.ocrCandidateKingdoms.join(" ");
      this.state.currentPage = 1;
      this.rerender();
      this.dom.ocrDetails.open = false;
      this.setOcrStatus(this.t("ocrApplied"));
    }

    handleSaveKingdomList() {
      const name = this.dom.kingdomListNameInput.value.trim();
      const value = this.dom.kingdomRangeListInput.value.trim();
      if (!name) {
        this.setStatus(this.t("saveNameRequired"), true);
        return;
      }
      if (!value) {
        this.setStatus(this.t("saveValueRequired"), true);
        return;
      }

      this.savedKingdomLists.save(name, value);
      this.renderSavedKingdomLists(name);
      this.dom.kingdomListNameInput.value = "";
      this.setStatus(this.t("savedListSaved", { name }));
    }

    handleLoadKingdomList() {
      const name = this.dom.savedKingdomListSelect.value;
      if (!name) {
        this.setStatus(this.t("savedListLoadSelect"), true);
        return;
      }

      const item = this.savedKingdomLists.readAll().find((entry) => entry.name === name);
      if (!item) {
        this.setStatus(this.t("savedListNotFound"), true);
        this.renderSavedKingdomLists();
        return;
      }

      this.applySavedKingdomListToInput(item);
      this.setStatus(this.t("savedListLoaded", { name: item.name }));
    }

    handleDeleteKingdomList() {
      const name = this.dom.savedKingdomListSelect.value;
      if (!name) {
        this.setStatus(this.t("savedListDeleteSelect"), true);
        return;
      }

      this.savedKingdomLists.remove(name);
      this.renderSavedKingdomLists();
      this.setStatus(this.t("savedListDeleted", { name }));
    }

    handleSavedKingdomSelectionChange() {
      const name = this.dom.savedKingdomListSelect.value;
      const item = this.savedKingdomLists.readAll().find((entry) => entry.name === name) || null;
      if (!item) return;
      this.applySavedKingdomListToInput(item);
    }

    applySavedKingdomListToInput(item) {
      if (!item) return;
      this.dom.kingdomRangeListInput.value = item.value;
      this.state.currentPage = 1;
      this.rerender();
    }

    getSelectedOcrFiles() {
      return this.dom.ocrImageInput.files ? [...this.dom.ocrImageInput.files] : [];
    }

    renderOcrProgress(message, mode, context = {}) {
      if (!message || typeof message !== "object") return;

      const status = String(message.status || "");
      const progress = Number(message.progress);
      const percent = Number.isFinite(progress) ? ` ${Math.round(progress * 100)}%` : "";

      if (mode === "download") {
        this.setOcrStatus(
          this.t("ocrPreparingProgress", {
            status: status || this.t("ocrProgressDefaultDownload"),
            percent,
          })
        );
        return;
      }

      if (mode === "recognize") {
        const prefix =
          Number.isFinite(context.current) && Number.isFinite(context.total)
            ? `(${context.current}/${context.total}${context.fileName ? `: ${context.fileName}` : ""}) `
            : "";
        this.setOcrStatus(
          this.t("ocrProcessingProgress", {
            prefix,
            status: status || this.t("ocrProgressDefaultProcessing"),
            percent,
          })
        );
      }
    }

    extractKingdomCandidates(text) {
      const matches = String(text || "").match(/\d{4,5}/g) || [];
      const values = [];
      for (const token of matches) {
        const normalizedToken = token.length === 5 ? token.slice(-4) : token;
        const value = Number(normalizedToken);
        if (!Number.isFinite(value)) continue;
        if (value < this.config.ocr.candidateMin || value > 9999) continue;
        values.push(value);
      }

      return [...new Set(values)].sort((a, b) => a - b);
    }

    setOcrStatus(text, isError = false) {
      this.dom.ocrStatusBody.textContent = text;
      this.dom.ocrStatus.className = isError
        ? "message is-danger is-light status-box mt-4"
        : "message is-light status-box mt-4";
    }

    updateOcrControls() {
      const hasFile = this.getSelectedOcrFiles().length > 0;
      this.dom.ocrPrepareButton.disabled = this.state.ocrPreparing || this.state.ocrRunning || this.state.ocrReady;
      this.dom.ocrImageInput.disabled = this.state.ocrPreparing || this.state.ocrRunning;
      this.dom.ocrRunButton.disabled =
        this.state.ocrPreparing || this.state.ocrRunning || !this.state.ocrReady || !hasFile;
      this.dom.ocrApplyButton.disabled = this.state.ocrRunning || this.state.ocrCandidateKingdoms.length === 0;
    }

    renderSavedKingdomLists(selectedName = "") {
      const items = this.savedKingdomLists.readAll();
      this.dom.savedKingdomListSelect.innerHTML = "";

      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = this.t("savedListPlaceholder");
      this.dom.savedKingdomListSelect.appendChild(placeholder);

      for (const item of items) {
        const option = document.createElement("option");
        option.value = item.name;
        option.textContent = item.name;
        this.dom.savedKingdomListSelect.appendChild(option);
      }

      this.dom.savedKingdomListSelect.value = selectedName && items.some((item) => item.name === selectedName)
        ? selectedName
        : "";
    }

    async handleFetch(forceRefresh) {
      const power = this.readPowerFromInput();
      if (!Number.isFinite(power)) return;
      const requestPlan = this.api.buildRequestPlan(power);
      this.setBusy(true);

      try {
        const cache = this.cacheStore.readByPower(power);
        if (!forceRefresh && this.cacheStore.isAvailable(cache, requestPlan)) {
          this.applyCacheResult(cache, power, requestPlan);
          return;
        }

        this.setStatus(this.t("apiLoading"));
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
        this.refreshPowerOptions();

        this.render(power, requestPlan);
        this.setStatus(this.t("fetchedLatest"));
        this.setCacheInfo(this.t("cacheFromApi", { date: this.formatDateTime(nowIso) }));
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

    handleStatusFilterPluginChange() {
      if (this.state.syncingStatusFilterUi) return;
      this.state.currentPage = 1;
      this.rerender();
    }

    handleSortChange(key) {
      if (!key) return;

      if (this.state.sort.key !== key) {
        this.state.sort = { key, direction: "asc" };
      } else if (this.state.sort.direction === "asc") {
        this.state.sort = { key, direction: "desc" };
      } else {
        this.state.sort = { key: null, direction: "asc" };
      }

      this.state.currentPage = 1;
      this.rerender();
    }

    movePage(direction) {
      this.state.currentPage += direction;
      this.rerender();
    }

    async handleExportTableImage() {
      if (this.state.exportingImage) return;
      if (this.dom.resultTable.hidden || this.dom.resultBody.children.length === 0) {
        this.setStatus(this.t("exportImageNoRows"), true);
        return;
      }
      if (typeof window.html2canvas !== "function") {
        this.setStatus(this.t("exportImageLibraryMissing"), true);
        return;
      }

      this.state.exportingImage = true;
      this.updateExportButtonDisabledState();
      this.setStatus(this.t("exportImagePreparing"));

      const container = this.createExportContainer();
      document.body.appendChild(container);

      try {
        const canvas = await window.html2canvas(container, {
          backgroundColor: "#ffffff",
          useCORS: true,
          logging: false,
          scale: Math.max(1.5, window.devicePixelRatio || 1),
        });
        const blob = await this.canvasToBlob(canvas);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = this.buildExportFileName();
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        this.setStatus(this.t("exportImageDone"));
      } catch (error) {
        console.error(error);
        const message = String(error && error.message ? error.message : this.t("unknownError"));
        this.setStatus(this.t("exportImageFailed", { message }), true);
      } finally {
        container.remove();
        this.state.exportingImage = false;
        this.updateExportButtonDisabledState();
      }
    }

    createExportContainer() {
      const rows = this.getExportRows();
      const useSplitLayout = rows.length >= 20;
      const palette = this.getExportPalette();
      const wrapper = document.createElement("div");
      wrapper.style.position = "fixed";
      wrapper.style.left = "-100000px";
      wrapper.style.top = "0";
      wrapper.style.width = `${useSplitLayout ? 1420 : Math.max(this.dom.resultTable.offsetWidth, 980)}px`;
      wrapper.style.padding = "32px";
      wrapper.style.background = `linear-gradient(135deg, ${palette.background} 0%, ${palette.backgroundAccent} 100%)`;
      wrapper.style.border = `1px solid ${palette.border}`;
      wrapper.style.borderRadius = "28px";
      wrapper.style.boxSizing = "border-box";
      wrapper.style.fontFamily = window.getComputedStyle(document.body).fontFamily;
      wrapper.style.color = palette.text;
      wrapper.style.boxShadow = "0 28px 60px rgba(15, 23, 42, 0.18)";
      wrapper.style.overflow = "hidden";

      const hero = document.createElement("div");
      hero.style.display = "flex";
      hero.style.alignItems = "flex-start";
      hero.style.justifyContent = "space-between";
      hero.style.gap = "18px";
      hero.style.marginBottom = "24px";
      hero.style.padding = "24px 26px";
      hero.style.border = `1px solid ${palette.border}`;
      hero.style.borderRadius = "24px";
      hero.style.background = `linear-gradient(135deg, ${palette.hero} 0%, ${palette.heroAccent} 100%)`;
      hero.style.color = palette.heroText;
      hero.style.boxShadow = "0 18px 34px rgba(15, 23, 42, 0.18)";

      const heroText = document.createElement("div");

      const eyebrow = document.createElement("div");
      eyebrow.textContent = "Migration Snapshot";
      eyebrow.style.fontSize = "11px";
      eyebrow.style.fontWeight = "700";
      eyebrow.style.letterSpacing = "0.16em";
      eyebrow.style.textTransform = "uppercase";
      eyebrow.style.opacity = "0.76";

      const heading = document.createElement("h2");
      heading.textContent = this.t("headerTitle");
      heading.style.margin = "8px 0 10px";
      heading.style.fontSize = "28px";
      heading.style.fontWeight = "800";
      heading.style.lineHeight = "1.2";

      const subHeading = document.createElement("p");
      subHeading.textContent = `${this.dom.filteredCount.textContent} | ${this.dom.pageIndicator.textContent}`;
      subHeading.style.margin = "0";
      subHeading.style.fontSize = "14px";
      subHeading.style.lineHeight = "1.65";
      subHeading.style.opacity = "0.9";

      heroText.appendChild(eyebrow);
      heroText.appendChild(heading);
      heroText.appendChild(subHeading);

      const chips = this.buildExportSummaryChips(rows, palette);

      hero.appendChild(heroText);
      hero.appendChild(chips);

      const tableLayout = this.buildExportTableLayout(rows, palette, useSplitLayout);

      wrapper.appendChild(hero);
      wrapper.appendChild(tableLayout);
      return wrapper;
    }

    getExportRows() {
      return [...this.dom.resultBody.querySelectorAll("tr")].map((row) =>
        [...row.querySelectorAll("td, th")].map((cell) => String(cell.textContent || "").replace(/\s+/g, " ").trim())
      );
    }

    getExportPalette() {
      const styles = window.getComputedStyle(document.documentElement);
      return {
        background: styles.getPropertyValue("--surface-2").trim() || "#f6f9fc",
        backgroundAccent: styles.getPropertyValue("--page-bg").trim() || "#eef4fb",
        border: styles.getPropertyValue("--border").trim() || "#d8dee8",
        text: styles.getPropertyValue("--text").trim() || "#1f2937",
        muted: styles.getPropertyValue("--muted").trim() || "#4b5563",
        strong: styles.getPropertyValue("--strong").trim() || "#163b67",
        tableHead: styles.getPropertyValue("--table-head").trim() || "#eef5fc",
        tableRow: styles.getPropertyValue("--table-row").trim() || "#ffffff",
        tableStripe: styles.getPropertyValue("--table-stripe").trim() || "#f4f8fd",
        indicatorBg: styles.getPropertyValue("--indicator-bg").trim() || "#edf5ff",
        indicatorText: styles.getPropertyValue("--indicator-text").trim() || "#1b4f85",
        hero: styles.getPropertyValue("--hero-base").trim() || "#183153",
        heroAccent: styles.getPropertyValue("--hero-accent").trim() || "#2f6ea5",
        heroText: styles.getPropertyValue("--hero-text").trim() || "#f7fbff",
      };
    }

    buildExportSummaryChips(rows, palette) {
      const wrap = document.createElement("div");
      wrap.style.display = "grid";
      wrap.style.gridTemplateColumns = "repeat(2, minmax(140px, 1fr))";
      wrap.style.gap = "10px";
      wrap.style.minWidth = "320px";

      const chips = [
        { label: "Rows", value: String(rows.length) },
        { label: "Layout", value: rows.length >= 20 ? "Split View" : "Single View" },
        { label: "Power", value: this.getExportPowerLabel() },
        { label: "Page", value: this.dom.pageIndicator.textContent || "-" },
        { label: "Exported", value: this.formatExportTimestamp() },
      ];

      for (const chip of chips) {
        const item = document.createElement("div");
        item.style.padding = "12px 14px";
        item.style.borderRadius = "18px";
        item.style.background = "rgba(255, 255, 255, 0.14)";
        item.style.border = "1px solid rgba(255, 255, 255, 0.18)";
        item.style.backdropFilter = "blur(10px)";

        const label = document.createElement("div");
        label.textContent = chip.label;
        label.style.fontSize = "10px";
        label.style.fontWeight = "700";
        label.style.letterSpacing = "0.12em";
        label.style.textTransform = "uppercase";
        label.style.opacity = "0.72";

        const value = document.createElement("div");
        value.textContent = chip.value;
        value.style.marginTop = "6px";
        value.style.fontSize = "15px";
        value.style.fontWeight = "700";

        item.appendChild(label);
        item.appendChild(value);
        wrap.appendChild(item);
      }

      return wrap;
    }

    buildExportTableLayout(rows, palette, useSplitLayout) {
      if (!useSplitLayout) {
        const single = document.createElement("div");
        single.appendChild(this.buildExportTableCard(rows, 1, palette, false));
        return single;
      }

      const grid = document.createElement("div");
      grid.style.display = "grid";
      grid.style.gridTemplateColumns = "repeat(2, minmax(0, 1fr))";
      grid.style.gap = "22px";
      grid.style.alignItems = "start";

      const splitIndex = Math.ceil(rows.length / 2);
      const leftRows = rows.slice(0, splitIndex);
      const rightRows = rows.slice(splitIndex);

      grid.appendChild(this.buildExportTableCard(leftRows, 1, palette, true));
      grid.appendChild(this.buildExportTableCard(rightRows, splitIndex + 1, palette, true));
      return grid;
    }

    buildExportTableCard(rows, startNumber, palette, isSplitLayout) {
      const card = document.createElement("section");
      card.style.padding = "18px";
      card.style.borderRadius = "24px";
      card.style.border = `1px solid ${palette.border}`;
      card.style.background = "rgba(255, 255, 255, 0.86)";
      card.style.boxShadow = "0 18px 38px rgba(15, 23, 42, 0.08)";

      const badge = document.createElement("div");
      badge.textContent = isSplitLayout
        ? `${startNumber}-${startNumber + rows.length - 1} items`
        : `${rows.length} items`;
      badge.style.display = "inline-flex";
      badge.style.alignItems = "center";
      badge.style.padding = "7px 12px";
      badge.style.borderRadius = "999px";
      badge.style.background = palette.indicatorBg;
      badge.style.color = palette.indicatorText;
      badge.style.fontSize = "12px";
      badge.style.fontWeight = "700";
      badge.style.marginBottom = "14px";

      card.appendChild(badge);
      card.appendChild(this.buildExportTable(rows, palette, startNumber));
      return card;
    }

    buildExportTable(rows, palette, startNumber = 1) {
      const sourceTable = this.dom.resultTable.querySelector("table");
      const table = document.createElement("table");
      table.style.width = "100%";
      table.style.borderCollapse = "collapse";
      table.style.tableLayout = "fixed";
      table.style.fontSize = "14px";
      table.style.border = `1px solid ${palette.border}`;
      table.style.background = palette.tableRow;
      table.style.borderRadius = "18px";
      table.style.overflow = "hidden";

      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");
      const headerCells = sourceTable ? [...sourceTable.querySelectorAll("thead th")] : [];

      const indexHeadCell = document.createElement("th");
      indexHeadCell.textContent = "#";
      indexHeadCell.style.padding = "11px 10px";
      indexHeadCell.style.border = `1px solid ${palette.border}`;
      indexHeadCell.style.background = palette.tableHead;
      indexHeadCell.style.color = palette.strong;
      indexHeadCell.style.textAlign = "center";
      indexHeadCell.style.fontWeight = "800";
      indexHeadCell.style.width = "56px";
      headerRow.appendChild(indexHeadCell);

      for (const th of headerCells) {
        const headCell = document.createElement("th");
        headCell.textContent = String(th.textContent || "").replace(/\s+/g, " ").trim();
        headCell.style.padding = "11px 12px";
        headCell.style.border = `1px solid ${palette.border}`;
        headCell.style.background = palette.tableHead;
        headCell.style.color = palette.strong;
        headCell.style.textAlign = "left";
        headCell.style.fontWeight = "800";
        headerRow.appendChild(headCell);
      }
      thead.appendChild(headerRow);
      table.appendChild(thead);

      const tbody = document.createElement("tbody");
      for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
        const tr = document.createElement("tr");
        const numberCell = document.createElement("td");
        numberCell.textContent = String(startNumber + rowIndex);
        numberCell.style.padding = "10px";
        numberCell.style.border = `1px solid ${palette.border}`;
        numberCell.style.background = rowIndex % 2 === 1 ? palette.tableStripe : palette.tableRow;
        numberCell.style.color = palette.indicatorText;
        numberCell.style.textAlign = "center";
        numberCell.style.fontWeight = "700";
        tr.appendChild(numberCell);

        for (const value of rows[rowIndex]) {
          const cell = document.createElement("td");
          cell.textContent = value;
          cell.style.padding = "10px 12px";
          cell.style.border = `1px solid ${palette.border}`;
          cell.style.color = palette.text;
          cell.style.background = rowIndex % 2 === 1 ? palette.tableStripe : palette.tableRow;
          cell.style.textAlign = "left";
          cell.style.fontWeight = "500";
          tr.appendChild(cell);
        }
        tbody.appendChild(tr);
      }
      table.appendChild(tbody);
      return table;
    }

    getExportPowerLabel() {
      const fromState = Number(this.state.currentDataPower);
      if (Number.isFinite(fromState) && fromState > 0) {
        return formatPowerLabel(fromState);
      }

      const fromInput = parsePowerInput(this.dom.powerSelect.value);
      if (Number.isFinite(fromInput) && fromInput > 0) {
        return formatPowerLabel(fromInput);
      }

      return "-";
    }

    formatExportTimestamp() {
      return new Intl.DateTimeFormat(this.i18n.currentLanguage() === "ja" ? "ja-JP" : "en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date());
    }

    canvasToBlob(canvas) {
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
            return;
          }
          reject(new Error("Canvas toBlob failed"));
        }, "image/png");
      });
    }

    buildExportFileName() {
      const now = new Date();
      const yyyy = String(now.getFullYear()).padStart(4, "0");
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      const hh = String(now.getHours()).padStart(2, "0");
      const mi = String(now.getMinutes()).padStart(2, "0");
      const ss = String(now.getSeconds()).padStart(2, "0");
      return `migration-table-${yyyy}${mm}${dd}-${hh}${mi}${ss}.png`;
    }

    resetFilters(options = {}) {
      const preservePageSize = options.preservePageSize === true;
      const shouldRerender = options.shouldRerender !== false;
      const currentPageSize = this.filter.normalizePageSize(
        this.dom.pageSizeSelect.value || this.state.filters.pageSize || this.filter.defaultPageSize()
      );

      this.state.filters = this.filter.createDefaultFilters();
      this.state.filters.pageSize = preservePageSize ? currentPageSize : this.filter.defaultPageSize();
      this.state.currentPage = 1;
      this.applyFiltersToUI();

      if (shouldRerender) this.rerender();
    }

    handlePowerChange() {
      const power = this.readPowerFromInput();
      if (!Number.isFinite(power)) return;
      const requestPlan = this.api.buildRequestPlan(power);
      const cache = this.cacheStore.readByPower(power);
      if (this.cacheStore.isAvailable(cache, requestPlan)) {
        this.applyCacheResult(cache, power, requestPlan);
        return;
      }

      this.state.kingdomList = [];
      this.state.filteredList = [];
      this.state.currentPage = 1;
      this.resetFilters({ preservePageSize: true, shouldRerender: false });
      this.hideResults();
      this.setStatus(this.t("noPowerCache"));
      this.setCacheInfo(this.t("cacheUnused"));
    }

    handlePowerCandidateSelect() {
      const value = String(this.dom.powerCandidateSelect.value || "").trim();
      if (!value) return;
      this.dom.powerSelect.value = value;
      this.dom.powerCandidateSelect.value = "";
      this.handlePowerChange();
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

      this.dom.powerSelect.value = formatPowerInputValue(power);
      const requestPlan = this.api.buildRequestPlan(power);
      if (!this.cacheStore.isAvailable(latest, requestPlan)) return;
      this.applyCacheResult(latest, power, requestPlan);
    }

    rerender() {
      if (this.state.kingdomList.length === 0) return;
      const power = parsePowerInput(this.dom.powerSelect.value);
      if (!Number.isFinite(power)) return;
      this.render(power, this.api.buildRequestPlan(power));
    }

    render(power, requestPlan) {
      if (this.state.kingdomList.length === 0) {
        this.hideResults();
        this.setStatus(this.t("noDisplayData"), true);
        return;
      }

      this.state.currentDataPower = power;
      this.syncFiltersFromUI();
      const filteredRows = this.filter.apply(this.state.kingdomList, this.state.filters);
      this.state.filteredList = this.sortRows(filteredRows);

      const pageSize = this.state.filters.pageSize;
      const totalPages = Math.max(1, Math.ceil(this.state.filteredList.length / pageSize));
      this.state.currentPage = this.clamp(this.state.currentPage, 1, totalPages);
      const pageRows = this.filter.paginate(this.state.filteredList, this.state.currentPage, pageSize);

      this.dom.filterPanel.hidden = false;
      this.dom.resultMeta.hidden = false;
      this.dom.cacheInfo.hidden = false;

      this.renderSortState();
      this.renderTable(pageRows);
      this.renderPager(totalPages, pageSize);

      const hasRows = pageRows.length > 0;
      this.dom.emptyState.hidden = hasRows;
      this.dom.resultTable.hidden = !hasRows;
      this.updateExportButtonDisabledState();
    }

    renderTable(rows) {
      this.dom.resultBody.innerHTML = "";
      for (const row of rows) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${row.kingdomId.toLocaleString()}</td>
          <td>${row.num.toLocaleString()}</td>
          <td>${this.escapeHtml(this.filter.statusLabel(row.status))}</td>
          <td>${row.rank.toLocaleString()}</td>
        `;
        this.dom.resultBody.appendChild(tr);
      }
    }

    renderSortState() {
      for (const button of this.dom.sortButtons) {
        const key = button.dataset.sortKey || "";
        const th = button.closest("th");
        const indicator = button.querySelector(".sort-indicator");
        const labelNode = button.querySelector("span:not(.sort-indicator)");
        const isActive = this.state.sort.key === key;
        const isDesc = isActive && this.state.sort.direction === "desc";

        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-label", this.t("sortAriaLabel", {
          label: (labelNode ? labelNode.textContent : button.textContent).replace(/\s+/g, " ").trim(),
        }));

        if (indicator) {
          indicator.textContent = isActive ? (isDesc ? "▼" : "▲") : "-";
        }

        if (th) {
          th.setAttribute("aria-sort", isActive ? (isDesc ? "descending" : "ascending") : "none");
        }
      }
    }

    sortRows(rows) {
      const { key, direction } = this.state.sort;
      if (!key) return rows;

      const multiplier = direction === "desc" ? -1 : 1;
      return [...rows].sort((a, b) => {
        const left = this.readSortValue(a, key);
        const right = this.readSortValue(b, key);
        if (left < right) return -1 * multiplier;
        if (left > right) return 1 * multiplier;
        return a.kingdomId - b.kingdomId;
      });
    }

    readSortValue(row, key) {
      switch (key) {
        case "kingdomId":
          return row.kingdomId;
        case "num":
          return row.num;
        case "status":
          return row.status;
        case "rank":
          return row.rank;
        default:
          return row.kingdomId;
      }
    }

    renderPager(totalPages, pageSize) {
      const fetchedCount = this.state.kingdomList.length;
      const totalCount = this.state.filteredList.length;
      const from = totalCount === 0 ? 0 : (this.state.currentPage - 1) * pageSize + 1;
      const to = totalCount === 0 ? 0 : Math.min(this.state.currentPage * pageSize, totalCount);

      this.dom.filteredCount.textContent = this.t("resultSummary", {
        fetched: fetchedCount.toLocaleString(),
        filtered: totalCount.toLocaleString(),
        from: from.toLocaleString(),
        to: to.toLocaleString(),
      });
      this.dom.pageIndicator.textContent = `${this.state.currentPage} / ${totalPages}`;
      this.dom.prevPageButton.disabled = this.state.currentPage <= 1 || totalCount === 0;
      this.dom.nextPageButton.disabled = this.state.currentPage >= totalPages || totalCount === 0;
    }

    hideResults() {
      this.dom.filterPanel.hidden = true;
      this.dom.resultMeta.hidden = true;
      this.dom.cacheInfo.hidden = true;
      this.dom.emptyState.hidden = true;
      this.dom.resultTable.hidden = true;
      this.state.currentDataPower = null;
      this.updateExportButtonDisabledState();
    }

    syncFiltersFromUI() {
      this.state.filters = {
        query: this.dom.searchInput.value.trim(),
        statuses: this.getSelectedStatusesFromUI(),
        kingdomRangeList: this.dom.kingdomRangeListInput.value.trim(),
        scrollMin: this.dom.scrollMinInput.value.trim(),
        scrollMax: this.dom.scrollMaxInput.value.trim(),
        pageSize: this.filter.normalizePageSize(this.dom.pageSizeSelect.value),
      };
    }

    applyFiltersToUI() {
      this.dom.searchInput.value = this.state.filters.query;
      const selectedStatuses = new Set(this.filter.normalizeStatusValues(this.state.filters.statuses));
      for (const option of this.getStatusFilterOptions()) {
        option.selected = selectedStatuses.has(Number(option.value));
      }
      this.syncStatusFilterUi();
      this.dom.pageSizeSelect.value = String(this.state.filters.pageSize);
      this.dom.kingdomRangeListInput.value = this.state.filters.kingdomRangeList;
      this.dom.scrollMinInput.value = this.state.filters.scrollMin;
      this.dom.scrollMaxInput.value = this.state.filters.scrollMax;
    }

    getStatusFilterOptions() {
      return [...this.dom.statusFilter.options];
    }

    getSelectedStatusesFromUI() {
      if (this.state.statusFilterUiReady && window.jQuery) {
        return window.jQuery(this.dom.statusFilter)
          .multipleSelect("getSelects")
          .map((value) => Number(value))
          .filter((value) => Number.isFinite(value))
          .sort((a, b) => a - b);
      }

      return this.getStatusFilterOptions()
        .filter((option) => option.selected)
        .map((option) => Number(option.value))
        .filter((value) => Number.isFinite(value))
        .sort((a, b) => a - b);
    }

    syncStatusFilterUi() {
      if (!this.state.statusFilterUiReady || !window.jQuery) return;
      this.state.syncingStatusFilterUi = true;
      try {
        const selectedValues = this.filter.normalizeStatusValues(this.state.filters.statuses).map(String);
        window.jQuery(this.dom.statusFilter).multipleSelect("setSelects", selectedValues);
        window.jQuery(this.dom.statusFilter).multipleSelect("refresh");
      } finally {
        this.state.syncingStatusFilterUi = false;
      }
    }

    setStatus(text, isError = false) {
      this.dom.status.hidden = false;
      this.dom.statusBody.textContent = text;
      this.dom.status.className = isError
        ? "message is-danger is-light status-box"
        : "message is-light status-box";
    }

    setCacheInfo(text) {
      this.dom.cacheInfo.textContent = text;
    }

    setBusy(isBusy) {
      this.dom.languageSelect.disabled = isBusy;
      this.dom.themeSelect.disabled = isBusy;
      this.dom.fetchButton.disabled = isBusy;
      this.dom.refetchButton.disabled = isBusy;
      this.dom.powerSelect.disabled = isBusy;
      this.dom.powerCandidateSelect.disabled = isBusy;
      this.dom.pageSizeSelect.disabled = isBusy;
      this.dom.statusFilter.disabled = isBusy;
      if (this.state.statusFilterUiReady && window.jQuery) {
        window.jQuery(this.dom.statusFilter).multipleSelect(isBusy ? "disable" : "enable");
      }
      this.dom.searchInput.disabled = isBusy;
      this.dom.kingdomRangeListInput.disabled = isBusy;
      this.dom.scrollMinInput.disabled = isBusy;
      this.dom.scrollMaxInput.disabled = isBusy;
      this.dom.resetFiltersButton.disabled = isBusy;
      this.updateExportButtonDisabledState(isBusy);

      if (isBusy) {
        this.dom.prevPageButton.disabled = true;
        this.dom.nextPageButton.disabled = true;
        return;
      }

      const pageSize = this.state.filters.pageSize || this.filter.defaultPageSize();
      const totalPages = Math.max(1, Math.ceil((this.state.filteredList.length || 0) / pageSize));
      this.dom.prevPageButton.disabled = this.state.currentPage <= 1 || this.state.filteredList.length === 0;
      this.dom.nextPageButton.disabled =
        this.state.currentPage >= totalPages || this.state.filteredList.length === 0;
    }

    updateExportButtonDisabledState(forceDisabled = false) {
      const hasRows = !this.dom.resultTable.hidden && this.dom.resultBody.children.length > 0;
      this.dom.exportTableImageButton.disabled = forceDisabled || this.state.exportingImage || !hasRows;
    }

    formatDateTime(isoLike) {
      return this.i18n.formatDateTime(isoLike);
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
      const message = String(error && error.message ? error.message : this.t("unknownError"));

      if (window.location.protocol === "file:") {
        return this.t("fileOpenFetchError", { browser: this.detectBrowserName() });
      }

      return this.t("fetchFailed", { message });
    }

    buildOcrErrorMessage(error) {
      const message = String(error && error.message ? error.message : this.t("unknownError"));
      if (window.location.protocol === "file:") {
        return this.t("fileOpenOcrError", { browser: this.detectBrowserName() });
      }
      return this.t("ocrFailed", { message });
    }

    applyCacheResult(cache, power, requestPlan) {
      this.state.kingdomList = this.filter.normalizeList(cache.kingdomList);
      this.dom.powerSelect.value = formatPowerInputValue(power);
      this.resetFilters({ preservePageSize: true, shouldRerender: false });
      this.render(power, requestPlan);
      const requestedAtText = this.formatDateTime(cache.requestedAt);
      this.setCacheInfo(this.t("cacheUsed", { date: requestedAtText }));
    }

    readPowerFromInput() {
      const parsed = parsePowerInput(this.dom.powerSelect.value);
      if (!Number.isFinite(parsed)) {
        this.setStatus(this.t("invalidPowerInput"), true);
        return null;
      }
      this.dom.powerSelect.value = formatPowerInputValue(parsed);
      return parsed;
    }

    detectBrowserName() {
      const ua = navigator.userAgent;
      if (ua.includes("Firefox/")) return "Firefox";
      if (ua.includes("Edg/")) return "Edge";
      if (ua.includes("OPR/")) return "Opera";
      if (ua.includes("Chrome/")) return "Chrome";
      if (ua.includes("Safari/")) return "Safari";
      return this.t("browserGeneric");
    }
  }

  const app = new MigrationApp(CONFIG);
  app.boot();

  function formatPowerLabel(valueInMillions) {
    if (valueInMillions <= 900) {
      return `${valueInMillions.toLocaleString()} M`;
    }

    if (valueInMillions % 100 !== 0) {
      return `${valueInMillions.toLocaleString()} M`;
    }

    return `${(valueInMillions / 1000).toFixed(1)} B`;
  }

  function formatPowerInputValue(valueInMillions) {
    const normalized = Number(valueInMillions);
    if (!Number.isFinite(normalized) || normalized <= 0) return "";
    if (normalized <= 900) return `${Math.round(normalized)}M`;
    if (normalized % 100 !== 0) return `${Math.round(normalized)}M`;
    return `${(normalized / 1000).toFixed(1)}B`;
  }

  function parsePowerInput(rawValue) {
    const raw = String(rawValue || "")
      .trim()
      .replaceAll(",", "")
      .replace(/\s+/g, "")
      .toUpperCase();
    if (!raw) return null;

    const match = raw.match(/^(\d+(?:\.\d+)?)([BM])?$/);
    if (!match) return null;

    const numberPart = Number(match[1]);
    const suffix = match[2] || "M";
    if (!Number.isFinite(numberPart) || numberPart <= 0) return null;

    if (suffix === "B") {
      if (match[1].includes(".") && match[1].split(".")[1].length > 1) return null;
      return Math.round(numberPart * 1000);
    }

    if (match[1].includes(".")) return null;
    return Math.round(numberPart);
  }
})();
