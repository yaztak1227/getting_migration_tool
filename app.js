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
    imageExport: {
      captureScale: 2,
      tableSingleWidth: 1180,
      tableSplitWidth: 1420,
      rankChartsWidth: 1440,
      rankChartsPerZipImage: 5,
      heatmapKingdomsPerImage: 45,
      heatmapBandsPerImage: 70,
    },
  };

  const TRANSLATIONS = {
    ja: {
      title: "移民巻物枚数チェック",
      headerTitle: "Lordsmobile 移民ツール",
      viewNavigation: "画面切り替え",
      kingdomInfoView: "王国情報",
      rankDistributionView: "ランキング分布図",
      headerInfoButtonAria: "ツール説明",
      headerInfoText:
        "検索パワーごとの移民対象王国一覧を取得し、そのままフィルタリング・ページ表示まで行えます。ローカルの Node.js プロキシ経由で API を取得します。",
      languageLabel: "Language",
      languageSelectAria: "言語選択",
      languageOptionJa: "日本語",
      languageOptionEn: "English",
      themeLabel: "Theme",
      themeSelectAria: "テーマ選択",
      sideMenu: "フィルタメニュー",
      search: "テキストフィルタ",
      searchPlaceholder: "王国番号・状態・ランクで絞り込み",
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
      power: "検索パワー",
      powerAria: "検索パワー",
      powerPlaceholder: "例: 3.5B または 3500M",
      powerCandidate: "候補から選択",
      powerCandidateAria: "検索パワー候補",
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
      rankChartButton: "グラフに表示",
      rankChartTitle: "ランキング分布図",
      rankChartPageNote: "キャッシュ済みデータから100M刻みの分布を表示します。",
      rankChartCloseAria: "閉じる",
      rankChartCachedPowers: "キャッシュ済みリスト",
      rankChartCacheOptions: "データ取得とキャッシュ設定",
      rankChartRefreshSelectedCache: "選択を再取得",
      rankChartPowerRange: "パワー範囲",
      rankChartPowerMin: "最小パワー",
      rankChartPowerMax: "最大パワー",
      rankChartPowerLower: "下限",
      rankChartPowerUpper: "上限",
      closeDataSettings: "設定を閉じる",
      rankChartPowerRangePlaceholder: "例: 1.0-2.0B または 1000M 1100M",
      rankChartKingdom: "王国番号（複数可）",
      rankChartKingdomPlaceholder: "例: 1234 1235 1236",
      rankChartRender: "グラフを作成",
      rankChartTypeButtonLine: "折れ線グラフに切替",
      rankChartTypeButtonBar: "棒グラフに切替",
      rankChartTabs: "グラフの種類",
      rankChartTabBar: "棒",
      rankChartTabLine: "折れ線",
      rankChartTabHeatmapH: "H横",
      rankChartTabHeatmapV: "H縦",
      rankChartHeatmapH: "横ヒートマップ：王国ごとの分布と合計人数",
      rankChartHeatmapV: "縦ヒートマップ：パワー帯ごとの王国比較",
      rankChartHeatmapTotal: "範囲内合計",
      rankChartHeatmapSummary: "人数 / 平均パワー",
      rankChartHeatmapZero: "0人",
      rankChartHeatmapUnavailable: "算出不可",
      rankChartHeatmapNote: "* 算出不可の区間を含む合計は、算出できた区間のみの人数です。",
      rankChartHeatmapDescription: "{from} – {to} / {count}王国 / 100M刻み",
      rankChartSort: "並び順",
      rankChartSortKingdomAsc: "王国番号：小さい順",
      rankChartSortKingdomDesc: "王国番号：大きい順",
      rankChartSortTotalDesc: "範囲内合計：多い順",
      rankChartSortTotalAsc: "範囲内合計：少ない順",
      rankChartSortAverageDesc: "平均パワー：高い順",
      rankChartSortAverageAsc: "平均パワー：低い順",
      rankChartAverage: "平均パワー（推計）",
      rankChartAverageUnavailable: "平均算出不可",
      rankChartAverageNote: "帯中央値を人数で重み付けした推計値。算出不可の帯は除外。",
      rankChartExportImage: "グラフ画像を保存",
      rankChartBack: "フィルタ画面へ戻る",
      scrollTop: "先頭へ戻る",
      rankChartNoCachedPowers: "キャッシュ済みデータがありません。先に取得してください。",
      rankChartInvalidSelection: "キャッシュ済みリストを複数選択するか、パワー範囲を入力してください。",
      rankChartInvalidKingdom: "王国番号を1件以上入力してください。",
      rankChartLibraryMissing: "Chart.js の読み込みに失敗しました。ネットワーク接続を確認して再読み込みしてください。",
      rankChartExportLibraryMissing: "html2canvas または JSZip の読み込みに失敗しました。ネットワーク接続を確認して再読み込みしてください。",
      rankChartNoData: "指定条件でプロットできるランキング分布がありません。",
      rankChartRendered: "{kingdom} のランキング分布を表示しました。",
      rankChartToggleKingdom: "K{kingdom} の表示を切り替え",
      rankChartRemoveKingdom: "K{kingdom} をリストから削除",
      rankChartKingdomAddPlaceholder: "国番号を追加",
      rankChartExportNoCharts: "画像に保存するグラフがありません。",
      rankChartExportPreparing: "グラフ画像を準備しています...",
      rankChartExportDone: "グラフ画像を保存しました。",
      rankChartExportFailed: "グラフ画像の保存に失敗しました: {message}",
      rankChartRefreshSelectRequired: "再取得するキャッシュ済みリストを1件以上選択してください。",
      rankChartRefreshLoading: "選択したキャッシュ済みリストを再取得しています... ({index}/{count})",
      rankChartRefreshDone: "{count}件のキャッシュ済みリストを再取得しました。",
      rankChartRefreshFailed: "キャッシュ済みリストの再取得に失敗しました: {message}",
      rankChartDatasetLabel: "人数",
      rankChartXAxis: "パワー帯",
      rankChartYAxis: "人数",
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
        "{count}枚のOCR結果から 4〜5桁の数字を候補として抽出します。スペース欠落で4の倍数桁になった数字は4桁ずつに分割し、5桁は前後の候補関係を見ながら近い4桁側へ補正しました。内容を確認してから反映してください。",
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
      batchFetchLoading: "{from} から {to} まで {count}件を取得中です...",
      batchFetchProgress: "取得中: {power} ({index}/{count})",
      batchFetchDone: "{from} から {to} まで {count}件のキャッシュ取得が完了しました。",
      fetchedLatest: "最新データを取得しました。",
      cacheFromApi: "参照元: API / 取得日時: {date}",
      noPowerCache: "この検索パワーのキャッシュはありません。取得するボタンを押してください。",
      invalidPowerInput:
        "検索パワーは {xxx.x}B または {xxxx}M 形式で入力してください（例: 3.5B）。",
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
      headerTitle: "Lordsmobile Migration Tool",
      viewNavigation: "Switch view",
      kingdomInfoView: "Kingdom info",
      rankDistributionView: "Rank distribution",
      headerInfoButtonAria: "Tool description",
      headerInfoText:
        "Fetch migration target kingdoms by search power, then filter and paginate in one screen. API data is retrieved through the local Node.js proxy.",
      languageLabel: "Language",
      languageSelectAria: "Language selector",
      languageOptionJa: "Japanese",
      languageOptionEn: "English",
      themeLabel: "Theme",
      themeSelectAria: "Theme selector",
      sideMenu: "Filter Menu",
      search: "Text Filter",
      searchPlaceholder: "Filter by kingdom, status, or rank",
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
      power: "Search Power",
      powerAria: "Search power",
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
      rankChartButton: "Show Chart",
      rankChartTitle: "Rank Distribution",
      rankChartPageNote: "Show 100M-step distributions from cached data.",
      rankChartCloseAria: "Close",
      rankChartCachedPowers: "Cached Lists",
      rankChartCacheOptions: "Data and cache settings",
      rankChartRefreshSelectedCache: "Refresh Selected",
      rankChartPowerRange: "Power Range",
      rankChartPowerMin: "Minimum power",
      rankChartPowerMax: "Maximum power",
      rankChartPowerLower: "Min",
      rankChartPowerUpper: "Max",
      closeDataSettings: "Close settings",
      rankChartPowerRangePlaceholder: "Example: 1.0-2.0B or 1000M 1100M",
      rankChartKingdom: "Kingdom IDs (multiple allowed)",
      rankChartKingdomPlaceholder: "Example: 1234 1235 1236",
      rankChartRender: "Create Chart",
      rankChartTypeButtonLine: "Switch to Line Chart",
      rankChartTypeButtonBar: "Switch to Bar Chart",
      rankChartTabs: "Chart type",
      rankChartTabBar: "Bar",
      rankChartTabLine: "Line",
      rankChartTabHeatmapH: "H horiz.",
      rankChartTabHeatmapV: "H vert.",
      rankChartHeatmapH: "Horizontal heatmap: kingdom distributions and totals",
      rankChartHeatmapV: "Vertical heatmap: kingdoms by power band",
      rankChartHeatmapTotal: "Range total",
      rankChartHeatmapSummary: "Players / average power",
      rankChartHeatmapZero: "0 players",
      rankChartHeatmapUnavailable: "Unavailable",
      rankChartHeatmapNote: "* Totals with unavailable bands include only bands that can be calculated.",
      rankChartHeatmapDescription: "{from} – {to} / {count} kingdoms / 100M bands",
      rankChartSort: "Sort by",
      rankChartSortKingdomAsc: "Kingdom ID: ascending",
      rankChartSortKingdomDesc: "Kingdom ID: descending",
      rankChartSortTotalDesc: "Range total: most first",
      rankChartSortTotalAsc: "Range total: fewest first",
      rankChartSortAverageDesc: "Average power: highest first",
      rankChartSortAverageAsc: "Average power: lowest first",
      rankChartAverage: "Average power (estimate)",
      rankChartAverageUnavailable: "Average unavailable",
      rankChartAverageNote: "Band midpoints weighted by player counts; unavailable bands are excluded.",
      rankChartExportImage: "Save Chart Images",
      rankChartBack: "Back to Filters",
      scrollTop: "Back to Top",
      rankChartNoCachedPowers: "No cached data exists. Fetch data first.",
      rankChartInvalidSelection: "Select multiple cached lists or enter a power range.",
      rankChartInvalidKingdom: "Enter at least one kingdom ID.",
      rankChartLibraryMissing: "Chart.js failed to load. Check your network connection and reload.",
      rankChartExportLibraryMissing: "html2canvas or JSZip failed to load. Check your network connection and reload.",
      rankChartNoData: "No rank distribution can be plotted for the selected conditions.",
      rankChartRendered: "Displayed rank distribution for {kingdom}.",
      rankChartToggleKingdom: "Toggle visibility for K{kingdom}",
      rankChartRemoveKingdom: "Remove K{kingdom} from the list",
      rankChartKingdomAddPlaceholder: "Add kingdom IDs",
      rankChartExportNoCharts: "There are no charts to save as an image.",
      rankChartExportPreparing: "Preparing chart image...",
      rankChartExportDone: "Saved the chart image(s).",
      rankChartExportFailed: "Failed to save chart image: {message}",
      rankChartRefreshSelectRequired: "Select at least one cached list to refresh.",
      rankChartRefreshLoading: "Refreshing selected cached lists... ({index}/{count})",
      rankChartRefreshDone: "Refreshed {count} cached lists.",
      rankChartRefreshFailed: "Failed to refresh cached lists: {message}",
      rankChartDatasetLabel: "Players",
      rankChartXAxis: "Power band",
      rankChartYAxis: "Players",
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
        "Extracted 4-5 digit number candidates from {count} OCR result images. Numbers packed into a multiple of 4 digits by missing spaces are split into 4-digit chunks, and each 5-digit value is corrected to the closer 4-digit side using neighboring candidates. Verify before applying.",
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
      batchFetchLoading: "Fetching {count} entries from {from} to {to}...",
      batchFetchProgress: "Fetching: {power} ({index}/{count})",
      batchFetchDone: "Cached {count} entries from {from} to {to}.",
      fetchedLatest: "Fetched latest data.",
      cacheFromApi: "Source: API / Fetched at: {date}",
      noPowerCache: "No cache exists for this search power. Click fetch.",
      invalidPowerInput: "Enter search power as {xxx.x}B or {xxxx}M (example: 3.5B).",
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
      this.setText("#openRankChartButton", "rankChartButton");
      this.setAttr("#scrollTopButton", "aria-label", "scrollTop");
      this.setAttr("#scrollTopButton", "title", "scrollTop");
      this.setText("#rankChartCachedPowersLabel", "rankChartCachedPowers");
      this.setAttr("#rankChartCacheOptionsSummary", "aria-label", "rankChartCacheOptions");
      this.setAttr("#rankChartCacheOptionsSummary", "title", "rankChartCacheOptions");
      this.setText("#dataSettingsTitle", "rankChartCacheOptions");
      this.setAttr("#closeDataSettingsButton", "aria-label", "closeDataSettings");
      this.setAttr("#appViewSwitch", "aria-label", "viewNavigation");
      this.setText("#showKingdomInfoButton", "kingdomInfoView");
      this.setText("#showRankDistributionButton", "rankDistributionView");
      this.setText("#refreshRankChartCacheButton", "rankChartRefreshSelectedCache");
      this.setText("#rankChartPowerRangeLabel", "rankChartPowerRange");
      this.setAttr("#rankChartPowerMin", "aria-label", "rankChartPowerMin");
      this.setAttr("#rankChartPowerMax", "aria-label", "rankChartPowerMax");
      this.setAttr("#rankChartPowerMinValue", "aria-label", "rankChartPowerMin");
      this.setAttr("#rankChartPowerMaxValue", "aria-label", "rankChartPowerMax");
      this.setText("#rankChartPowerLowerLabel", "rankChartPowerLower");
      this.setText("#rankChartPowerUpperLabel", "rankChartPowerUpper");
      this.setText("#rankChartKingdomLabel", "rankChartKingdom");
      this.setAttr("#rankChartKingdomEntryInput", "placeholder", "rankChartKingdomAddPlaceholder");
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
      this.mainSearchPage = document.getElementById("mainSearchPage");
      this.searchContent = document.getElementById("searchContent");
      this.rankChartPage = document.getElementById("rankChartPage");
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
      this.openRankChartButton = document.getElementById("openRankChartButton");
      this.rankChartPowerList = document.getElementById("rankChartPowerList");
      this.refreshRankChartCacheButton = document.getElementById("refreshRankChartCacheButton");
      this.rankChartPowerRangeInput = document.getElementById("rankChartPowerRangeInput");
      this.rankChartPowerMin = document.getElementById("rankChartPowerMin");
      this.rankChartPowerMax = document.getElementById("rankChartPowerMax");
      this.rankChartPowerSlider = document.getElementById("rankChartPowerSlider");
      this.rankChartPowerMinValue = document.getElementById("rankChartPowerMinValue");
      this.rankChartPowerMaxValue = document.getElementById("rankChartPowerMaxValue");
      this.rankChartPowerRangeFill = document.getElementById("rankChartPowerRangeFill");
      this.rankChartPowerTicks = document.getElementById("rankChartPowerTicks");
      this.rankChartCacheOptions = document.getElementById("rankChartCacheOptions");
      this.rankChartCacheOptionsSummary = document.getElementById("rankChartCacheOptionsSummary");
      this.rankChartKingdomInput = document.getElementById("rankChartKingdomInput");
      this.rankChartKingdomEntryInput = document.getElementById("rankChartKingdomEntryInput");
      this.rankChartKingdomField = document.getElementById("rankChartKingdomField");
      this.rankChartTabs = document.getElementById("rankChartTabs");
      this.rankChartTabButtons = [...this.rankChartTabs.querySelectorAll('[role="tab"]')];
      this.rankChartSortControl = document.getElementById("rankChartSortControl");
      this.rankChartSortSelect = document.getElementById("rankChartSortSelect");
      this.rankChartSortLabel = document.getElementById("rankChartSortLabel");
      this.exportRankChartsImageButton = document.getElementById("exportRankChartsImageButton");
      this.rankChartStatus = document.getElementById("rankChartStatus");
      this.rankChartStatusMessage = document.getElementById("rankChartStatusMessage");
      this.rankChartKingdomToggles = document.getElementById("rankChartKingdomToggles");
      this.rankChartCanvasList = document.getElementById("rankChartCanvasList");
      this.appViewSwitch = document.getElementById("appViewSwitch");
      this.showKingdomInfoButton = document.getElementById("showKingdomInfoButton");
      this.showRankDistributionButton = document.getElementById("showRankDistributionButton");
      this.scrollTopButton = document.getElementById("scrollTopButton");
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
      this.applyKingdomTagContrast();
      this.dom.themeSelect.value = theme.id;
      window.localStorage.setItem(this.config.themeStorageKey, theme.id);
    }

    applyKingdomTagContrast() {
      const styles = window.getComputedStyle(this.dom.themeRoot);
      const ctx = document.createElement("canvas").getContext("2d");
      for (const [property, background] of [
        ["--kingdom-tag-on-text", "--bulma-primary-soft"],
        ["--kingdom-tag-off-text", "--surface-2"],
      ]) {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = styles.getPropertyValue(background).trim() || "#ffffff";
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b, alpha] = ctx.getImageData(0, 0, 1, 1).data;
        const linear = [r, g, b].map((value) => {
          const channel = (value * alpha / 255 + 255 - alpha) / 255;
          return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
        });
        const luminance = linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
        const blackContrast = (luminance + 0.05) / 0.05;
        const whiteContrast = 1.05 / (luminance + 0.05);
        this.dom.themeRoot.style.setProperty(property, blackContrast >= whiteContrast ? "#000000" : "#ffffff");
      }
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
        for (const cache of Object.values(parsed.items)) {
          if (cache && cache.kingdomRowFormat === "tuple-v1" && Array.isArray(cache.kingdomList)) {
            cache.kingdomList = cache.kingdomList.map(([kingdomId, rank, num, status]) =>
              ({ kingdomId, rank, num, status }));
            delete cache.kingdomRowFormat;
          }
        }
        return parsed;
      } catch (error) {
        console.warn("localStorage cache parse error", error);
        return { items: {} };
      }
    }

    writeStore(store, protectedKey = "") {
      try {
        window.localStorage.setItem(this.config.cacheStorageKey, this.serializeStore(store));
        return true;
      } catch (error) {
        if (!this.isQuotaExceededError(error)) throw error;
      }

      const items = store && store.items && typeof store.items === "object" ? store.items : {};
      const keyToKeep = String(protectedKey || "");
      const removableKeys = Object.keys(items)
        .filter((key) => key !== keyToKeep)
        .sort((a, b) => this.cacheTimestamp(items[a]) - this.cacheTimestamp(items[b]));

      for (const key of removableKeys) {
        delete items[key];
        try {
          window.localStorage.setItem(this.config.cacheStorageKey, this.serializeStore({ ...store, items }));
          console.warn("localStorage cache pruned because quota was exceeded");
          return true;
        } catch (error) {
          if (!this.isQuotaExceededError(error)) throw error;
        }
      }

      console.warn("localStorage cache write skipped because quota was exceeded");
      return false;
    }

    serializeStore(store) {
      const items = Object.fromEntries(Object.entries(store.items || {}).map(([key, cache]) => {
        const rows = cache && cache.kingdomList;
        if (!Array.isArray(rows) || !rows.every((row) =>
          row && [row.kingdomId, row.rank, row.num, row.status].every(Number.isFinite))) {
          return [key, cache];
        }
        return [key, {
          ...cache,
          kingdomRowFormat: "tuple-v1",
          kingdomList: rows.map(({ kingdomId, rank, num, status }) => [kingdomId, rank, num, status]),
        }];
      }));
      return JSON.stringify({ ...store, items });
    }

    cacheTimestamp(value) {
      const timestamp = Date.parse(value && value.requestedAt ? value.requestedAt : "");
      return Number.isFinite(timestamp) ? timestamp : 0;
    }

    isQuotaExceededError(error) {
      return Boolean(
        error &&
          (error.name === "QuotaExceededError" ||
            error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
            error.code === 22 ||
            error.code === 1014)
      );
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

    write(value, { deferAverage = false } = {}) {
      const key = String(value && value.requestPlan ? value.requestPlan.power : "");
      if (key) {
        const store = this.readStore();
        store.items[key] = value;
        this.writeStore(store, key);
      }

      // 旧形式との互換のために最新結果をCookieにも保存する（サイズ超過時はlocalStorageのみ有効）。
      try {
        const serialized = encodeURIComponent(JSON.stringify(value));
        document.cookie =
          `${this.config.cookieName}=${serialized}; max-age=${this.config.cookieMaxAgeSec}; path=/; SameSite=Lax`;
      } catch (error) {
        console.warn("legacy cookie cache write skipped", error);
      }
      if (!deferAverage) this.updateAverage();
    }

    updateAverage() {
      return this.getAverage(Object.keys(this.readStore().items || {}).map(Number));
    }

    getAverage(powers) {
      const store = this.readStore();
      const selected = [...new Set(powers)].filter((power) => Number.isFinite(power) && power > 0).sort((a, b) => a - b);
      if (!selected.length) return { values: {} };
      const steps = [];
      for (let power = Math.ceil(selected[0] / 100) * 100; power <= selected[selected.length - 1]; power += 100) steps.push(power);
      const maps = steps.map((power) => {
        const cache = store.items[String(power)];
        const rows = cache && Array.isArray(cache.kingdomList) ? cache.kingdomList : [];
        return new Map(rows.map((row) => [Number(row.kingdomId ?? row.kingdom_id ?? row.id), Number(row.rank)]));
      });
      // Include the source ranks, not only timestamps: imported caches can keep their original dates.
      const signature = steps.map((power, index) => {
        let hash = 2166136261;
        for (const [kingdomId, rank] of maps[index]) {
          hash = Math.imul(hash ^ (kingdomId | 0), 16777619);
          hash = Math.imul(hash ^ (rank | 0), 16777619);
        }
        return `${power}:${store.items[String(power)]?.requestedAt || ""}:${maps[index].size}:${hash >>> 0}`;
      }).join("|");
      const key = `${selected[0]}-${selected[selected.length - 1]}`;
      const cached = store.average?.version === 1 ? store.average.ranges?.[key] : null;
      if (cached && cached.signature === signature && cached.values && typeof cached.values === "object") return cached;

      const sums = new Map();
      for (let index = 0; index < maps.length; index += 1) {
        for (const id of maps[index].keys()) {
          if (Number.isFinite(id) && !sums.has(id)) sums.set(id, { weighted: 0, count: 0 });
        }
        if (!index) continue;
        const midpoint = (steps[index - 1] + steps[index]) / 2;
        for (const [id, rank] of maps[index - 1]) {
          const next = maps[index].get(id);
          if (!sums.has(id) || !Number.isFinite(rank) || !Number.isFinite(next) || rank <= 0 || next <= 0) continue;
          const count = Math.abs(next - rank);
          const sum = sums.get(id);
          sum.count += count;
          sum.weighted += midpoint * count;
        }
      }
      const result = {
        signature,
        from: selected[0],
        to: selected[selected.length - 1],
        values: Object.fromEntries([...sums].map(([id, sum]) => [id, sum.count > 0 ? sum.weighted / sum.count : null])),
      };
      this.persistAverage(key, result);
      return result;
    }

    persistAverage(key, result) {
      try {
        // Add derived metadata to the original JSON without rewriting rows, formats, or dates.
        const raw = window.localStorage.getItem(this.config.cacheStorageKey);
        if (!raw) return;
        const stored = JSON.parse(raw);
        if (!stored || !stored.items || typeof stored.items !== "object") return;
        const ranges = stored.average?.version === 1 ? { ...stored.average.ranges } : {};
        delete ranges[key];
        ranges[key] = result;
        const keys = Object.keys(ranges);
        while (keys.length > 8) delete ranges[keys.shift()];
        stored.average = { version: 1, unit: "M", method: "band-midpoint-weighted", ranges };
        window.localStorage.setItem(this.config.cacheStorageKey, JSON.stringify(stored));
      } catch (error) {
        // Average persistence must never evict source caches, even when storage is full.
        console.warn("average cache persistence skipped", error);
      }
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
        exportingRankChartsImage: false,
        statusFilterUiReady: false,
        syncingStatusFilterUi: false,
        rankCharts: [],
        rankChartType: "bar",
        rankChartSort: "kingdom-asc",
        rankChartLastResult: null,
        rankChartSourceResult: null,
        rankChartInputTimer: null,
        rankChartPowerDomain: null,
        rankChartPowerSelection: null,
      };
    }

    boot() {
      this.i18n.init(() => this.handleLanguageChange());
      this.themeManager.init();
      this.cacheStore.updateAverage();
      this.initPowerOptions();
      this.initFilterOptions();
      this.initStatusFilterUi();
      this.renderSavedKingdomLists();
      this.bindEvents();
      this.setCacheInfo(this.t("cacheUnused"));
      this.renderRuntimeNotice();
      this.updateRankChartActionButtonLabels();
      this.updateOcrControls();
      this.updateScrollTopButtonVisibility();
      this.restoreFromCacheOnLoad();
      this.syncPageFromUrl();
      this.dom.rankChartCacheOptions.open = this.readCachedPowerValues().length === 0;
    }

    t(key, vars = {}) {
      return this.i18n.t(key, vars);
    }

    handleLanguageChange() {
      this.config.statusLabelMap = this.i18n.statusLabelMap();
      this.config.unknownStatusLabel = this.t("unknownStatus");
      this.config.listSortLocale = this.i18n.currentLanguage();
      this.i18n.applyStaticTexts();
      this.updateRankChartActionButtonLabels();
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
      if (!this.dom.rankChartPage.hidden && this.state.rankChartSourceResult) {
        this.handleRenderRankChart();
      }
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
      this.dom.kingdomRangeListInput.addEventListener("input", () => {
        this.updateSearchSelectionUrl();
        this.handleFilterInput();
      });
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
      this.dom.resetFiltersButton.addEventListener("click", () => {
        this.resetFilters();
        this.updateSearchSelectionUrl();
      });
      this.dom.prevPageButton.addEventListener("click", () => this.movePage(-1));
      this.dom.nextPageButton.addEventListener("click", () => this.movePage(1));
      this.dom.exportTableImageButton.addEventListener("click", () => this.handleExportTableImage());
      this.dom.openRankChartButton.addEventListener("click", () => this.navigateToRankChartPage());
      this.dom.showKingdomInfoButton.addEventListener("click", () => {
        if (this.isRankingPath()) this.navigateToSearchPage();
      });
      this.dom.showRankDistributionButton.addEventListener("click", () => {
        if (this.isRankingPath()) return;
        this.navigateToRankChartPage();
      });
      for (const [index, slider] of [this.dom.rankChartPowerMin, this.dom.rankChartPowerMax].entries()) {
        slider.addEventListener("input", () => this.handleRankChartPowerSlider(index, Number(slider.value)));
        slider.addEventListener("change", () => this.handleRenderRankChart({ preview: true }));
        slider.addEventListener("keydown", (event) => this.handleRankChartPowerSliderKeydown(event, index));
      }
      for (const input of [this.dom.rankChartPowerMinValue, this.dom.rankChartPowerMaxValue]) {
        input.addEventListener("input", () => {
          window.clearTimeout(this.state.rankChartInputTimer);
          this.state.rankChartInputTimer = window.setTimeout(() => this.handleRankChartPowerBounds(), 250);
        });
        input.addEventListener("blur", () => this.handleRankChartPowerBounds(true));
        input.addEventListener("keydown", (event) => {
          if (event.key === "Enter" && !event.isComposing) {
            event.preventDefault();
            this.handleRankChartPowerBounds(true);
          }
        });
      }
      this.dom.rankChartPowerSlider.addEventListener("click", (event) => {
        if (event.target instanceof HTMLInputElement || !this.state.rankChartPowerDomain) return;
        const rect = this.dom.rankChartPowerSlider.getBoundingClientRect();
        const position = Math.max(0, Math.min(10000, (event.clientX - rect.left - 8) / (rect.width - 16) * 10000));
        const [min, max] = this.state.rankChartPowerSelection.map((value) => this.rankChartPowerPosition(value));
        this.handleRankChartPowerSlider(Math.abs(position - min) <= Math.abs(position - max) ? 0 : 1, position);
      });
      document.addEventListener("click", (event) => {
        if (!this.dom.rankChartCacheOptions.contains(event.target)) this.dom.rankChartCacheOptions.open = false;
      });
      document.addEventListener("focusin", (event) => {
        if (!this.dom.rankChartCacheOptions.contains(event.target)) this.dom.rankChartCacheOptions.open = false;
      });
      this.dom.rankChartCacheOptions.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          this.dom.rankChartCacheOptions.open = false;
          this.dom.rankChartCacheOptionsSummary.focus();
        }
      });
      document.getElementById("closeDataSettingsButton").addEventListener("click", () => {
        this.dom.rankChartCacheOptions.open = false;
        this.dom.rankChartCacheOptionsSummary.focus();
      });
      window.addEventListener("resize", () => this.renderRankChartPowerTicks());
      this.rankChartResizeObserver = new ResizeObserver(() => {
        if (this.dom.rankChartPage.hidden || this.state.exportingRankChartsImage || !window.MigrationHeatmap.isHeatmap(this.state.rankChartType)) return;
        const canvas = this.dom.rankChartCanvasList.querySelector("canvas");
        const width = Math.max(900, this.dom.rankChartCanvasList.clientWidth - 2);
        if (canvas && Math.abs(parseFloat(canvas.style.width) - width) >= 1 && this.state.rankChartLastResult?.charts.length) {
          this.renderRankChart(this.state.rankChartLastResult);
        }
      });
      this.rankChartResizeObserver.observe(this.dom.rankChartCanvasList);
      this.dom.rankChartPowerList.addEventListener("change", () => {
        this.dom.rankChartPowerRangeInput.value = "";
        this.handleRenderRankChart({ preview: true });
      });
      this.dom.refreshRankChartCacheButton.addEventListener("click", () => this.handleRefreshRankChartSelectedCache());
      this.dom.rankChartKingdomToggles.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-rank-chart-kingdom]");
        if (button) this.handleToggleRankChartKingdom(Number(button.dataset.rankChartKingdom));
        const remove = event.target.closest("button[data-remove-rank-chart-kingdom]");
        if (remove) this.handleRemoveRankChartKingdom(Number(remove.dataset.removeRankChartKingdom));
      });
      this.dom.rankChartKingdomField.addEventListener("click", (event) => {
        if (event.target === this.dom.rankChartKingdomField) this.dom.rankChartKingdomEntryInput.focus();
      });
      this.dom.rankChartKingdomEntryInput.addEventListener("keydown", (event) => {
        if (event.isComposing) return;
        if (["Enter", ",", " ", "/"].includes(event.key)) {
          event.preventDefault();
          this.handleRenderRankChart();
        } else if (event.key === "Backspace" && !event.target.value) {
          const { kingdomIds } = parseRankChartKingdomSelection(this.dom.rankChartKingdomInput.value);
          if (kingdomIds.length) {
            event.preventDefault();
            this.handleRemoveRankChartKingdom(kingdomIds[kingdomIds.length - 1]);
          }
        }
      });
      this.dom.rankChartKingdomEntryInput.addEventListener("input", () => this.scheduleRankChartInputRender());
      this.dom.rankChartKingdomEntryInput.addEventListener("blur", (event) => {
        if (this.dom.rankChartKingdomField.contains(event.relatedTarget)) return;
        if (event.target.value.trim()) this.handleRenderRankChart();
      });
      for (const tab of this.dom.rankChartTabButtons) {
        tab.addEventListener("click", () => this.handleSelectRankChartType(tab.dataset.chartType));
        tab.addEventListener("keydown", (event) => this.handleRankChartTabKeydown(event));
      }
      this.dom.rankChartSortSelect.addEventListener("change", () => {
        if (this.state.exportingRankChartsImage || this.state.busy) return;
        this.state.rankChartSort = this.dom.rankChartSortSelect.value;
        this.updateRankChartUrl();
        if (this.state.rankChartLastResult) this.renderRankChart(this.state.rankChartLastResult);
      });
      this.dom.themeSelect.addEventListener("change", () => {
        if (!this.dom.rankChartPage.hidden && this.state.rankChartLastResult && !this.state.exportingRankChartsImage) {
          this.renderRankChart(this.state.rankChartLastResult);
        }
      });
      this.dom.exportRankChartsImageButton.addEventListener("click", () => this.handleExportRankChartsImage());
      this.dom.scrollTopButton.addEventListener("click", () => this.handleScrollTop());
      window.addEventListener("scroll", () => this.updateScrollTopButtonVisibility(), { passive: true });
      window.addEventListener("popstate", () => this.syncPageFromUrl());
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
        const orderedCandidates = [];
        let previousCandidate = null;

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

          const candidates = this.extractKingdomCandidates(text, previousCandidate);
          for (const candidate of candidates) {
            orderedCandidates.push(candidate);
            previousCandidate = candidate;
          }
        }

        const mergedText = allTexts.join("\n\n").trim();
        const candidates = [...new Set(orderedCandidates)].sort((a, b) => a - b);
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
      this.updateSearchSelectionUrl();
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
      this.updateSearchSelectionUrl();
      this.state.currentPage = 1;
      this.rerender();
    }

    navigateToRankChartPage() {
      this.syncFiltersFromUI();
      const current = this.readRankChartUrlParams();
      const powerSpec = (parsePowerRangeInput(current.powerSpec)?.length > 1 ? current.powerSpec : "") || this.buildRankChartPowerSpecFromSearch();
      const kingdomSpec = parseRankChartKingdomSelection(current.kingdomSpec).kingdomIds.length
        ? current.kingdomSpec : this.buildRankChartKingdomSpecFromSearch();
      const url = new URL(window.location.href);
      url.pathname = this.buildRankingPath();
      for (const key of ["powers", "kingdoms"]) url.searchParams.delete(key);
      if (powerSpec) url.searchParams.set("power", powerSpec);
      else url.searchParams.delete("power");
      if (kingdomSpec) url.searchParams.set("kingdom", kingdomSpec);
      else url.searchParams.delete("kingdom");
      if (location.protocol === "file:") url.searchParams.set("view", "ranking");
      url.searchParams.set("tab", this.state.rankChartType);
      url.searchParams.set("sort", this.state.rankChartSort);
      window.history.pushState(null, "", this.selectionUrl(url));
      this.syncPageFromUrl();
    }

    buildRankChartPowerSpecFromSearch() {
      const rawPower = this.dom.powerSelect.value.trim();
      const rangePowers = parsePowerRangeInput(rawPower);
      if (rangePowers && rangePowers.length > 1) return rawPower;

      const cachedPowers = this.readCachedPowerValues().sort((a, b) => a - b);
      if (cachedPowers.length > 1) {
        return `${formatPowerInputValue(cachedPowers[0])}-${formatPowerInputValue(cachedPowers[cachedPowers.length - 1])}`;
      }

      return rawPower;
    }

    buildRankChartKingdomSpecFromSearch() {
      const rawKingdoms = this.dom.kingdomRangeListInput.value.trim();
      const kingdomIds = parseKingdomIdsInput(rawKingdoms);
      if (kingdomIds.length > 0) return kingdomIds.join(",");

      if (rawKingdoms && this.state.filteredList.length > 0) {
        return this.state.filteredList.map((row) => row.kingdomId).join(",");
      }

      return "";
    }

    navigateToSearchPage() {
      const params = this.readRankChartUrlParams();
      const url = new URL(window.location.href);
      if (location.protocol === "file:") url.searchParams.set("view", "kingdom");
      else url.pathname = "/";
      for (const key of ["powers", "kingdoms"]) url.searchParams.delete(key);
      if (params.powerSpec) url.searchParams.set("power", params.powerSpec);
      else url.searchParams.delete("power");
      if (params.kingdomSpec) url.searchParams.set("kingdom", params.kingdomSpec);
      else url.searchParams.delete("kingdom");
      window.history.pushState(null, "", this.selectionUrl(url));
      this.syncPageFromUrl();
    }

    selectionUrl(url) {
      const query = url.searchParams.toString().replace(/%2C/gi, ",").replace(/%21/gi, "!");
      return `${url.pathname}${query ? `?${query}` : ""}${url.hash}`;
    }

    updateSearchSelectionUrl({ powerSpec: requestedPowerSpec } = {}) {
      if (this.isRankingPath()) return;
      const url = new URL(window.location.href);
      const current = this.readRankChartUrlParams();
      const powerSpec = requestedPowerSpec || current.powerSpec || this.dom.rankChartPowerRangeInput.value || this.buildRankChartPowerSpecFromSearch();
      const rawKingdoms = this.dom.kingdomRangeListInput.value.trim();
      const selection = parseRankChartKingdomSelection(rawKingdoms);
      const hidden = new Set(selection.hiddenKingdomIds);
      const kingdomSpec = selection.kingdomIds.length
        ? selection.kingdomIds.map((id) => `${hidden.has(id) ? "!" : ""}${id}`).join(",") : rawKingdoms;
      if (powerSpec) url.searchParams.set("power", powerSpec);
      else url.searchParams.delete("power");
      if (kingdomSpec) url.searchParams.set("kingdom", kingdomSpec);
      else url.searchParams.delete("kingdom");
      for (const key of ["powers", "kingdoms"]) url.searchParams.delete(key);
      url.searchParams.set("tab", this.state.rankChartType);
      url.searchParams.set("sort", this.state.rankChartSort);
      const next = this.selectionUrl(url);
      if (next !== `${location.pathname}${location.search}${location.hash}`) history.replaceState(null, "", next);
    }

    restoreSearchSelectionFromUrl() {
      const search = new URLSearchParams(location.search);
      if (!["power", "powers", "kingdom", "kingdoms"].some((key) => search.has(key))) return;
      const params = this.readRankChartUrlParams();
      this.state.rankChartType = params.chartType;
      this.state.rankChartSort = params.sort;
      this.dom.kingdomRangeListInput.value = params.kingdomSpec.replace(/!(?=\d)/g, "");
      this.dom.rankChartKingdomInput.value = params.kingdomSpec;
      this.dom.rankChartPowerRangeInput.value = params.powerSpec;
      this.renderRankChartKingdomToggles(parseRankChartKingdomSelection(params.kingdomSpec));
      this.renderRankChartPowerOptions(parsePowerRangeInput(params.powerSpec) || []);
      this.updateRankChartTabs();
      this.rerender();
    }

    showRankChartPage() {
      this.updateAppViewSwitch(true);
      this.renderRankChartPowerOptions();
      document.body.classList.add("is-ranking-view");
      this.dom.mainSearchPage.hidden = false;
      this.dom.searchContent.hidden = true;
      this.dom.rankChartPage.hidden = false;
      if (this.readCachedPowerValues().length === 0) {
        this.setRankChartStatus(this.t("rankChartNoCachedPowers"), true);
      } else if (!this.dom.rankChartStatus.textContent) {
        this.setRankChartStatus("");
      }
      this.updateScrollTopButtonVisibility();
    }

    showSearchPage() {
      this.updateAppViewSwitch(false);
      document.body.classList.remove("is-ranking-view");
      this.dom.rankChartPage.hidden = true;
      this.dom.mainSearchPage.hidden = false;
      this.dom.searchContent.hidden = false;
      this.updateScrollTopButtonVisibility();
    }

    updateAppViewSwitch(ranking) {
      this.dom.appViewSwitch.dataset.view = ranking ? "ranking" : "kingdom";
      for (const [button, selected] of [[this.dom.showKingdomInfoButton, !ranking], [this.dom.showRankDistributionButton, ranking]]) {
        if (selected) button.setAttribute("aria-current", "page");
        else button.removeAttribute("aria-current");
      }
    }

    handleScrollTop() {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    updateScrollTopButtonVisibility() {
      const shouldShow = window.scrollY > 220;
      this.dom.scrollTopButton.hidden = !shouldShow;
    }

    syncPageFromUrl() {
      if (this.isRankingPath()) {
        this.restoreRankChartFromUrl();
        return;
      }
      this.showSearchPage();
      this.restoreSearchSelectionFromUrl();
    }

    isRankingPath() {
      if (location.protocol === "file:") return new URLSearchParams(location.search).get("view") === "ranking";
      return window.location.pathname === "/ranking" || window.location.pathname.startsWith("/ranking/");
    }

    renderRankChartPowerOptions(selectedPowers = []) {
      const selected = new Set(selectedPowers.map((value) => String(value)));
      const values = this.readCachedPowerValues().sort((a, b) => a - b);
      this.dom.rankChartPowerList.innerHTML = "";
      for (const value of values) {
        const option = document.createElement("option");
        option.value = String(value);
        option.textContent = this.buildCachedPowerOptionLabel(value);
        option.selected = selected.has(String(value));
        this.dom.rankChartPowerList.appendChild(option);
      }
      this.syncRankChartPowerSlider();
    }

    rankChartPowerPosition(power) {
      const domain = this.state.rankChartPowerDomain;
      return domain ? Math.max(0, Math.min(10000, Math.log(power / domain.min) / Math.log(domain.max / domain.min) * 10000)) : 0;
    }

    syncRankChartPowerSlider(powers) {
      const cached = this.readCachedPowerValues().sort((a, b) => a - b);
      if (cached.length < 2) {
        this.state.rankChartPowerDomain = null;
        this.state.rankChartPowerSelection = null;
        this.dom.rankChartPowerMinValue.value = "";
        this.dom.rankChartPowerMaxValue.value = "";
        this.dom.rankChartPowerTicks.replaceChildren();
        this.dom.rankChartPowerMin.disabled = true;
        this.dom.rankChartPowerMax.disabled = true;
        this.dom.rankChartPowerMinValue.disabled = true;
        this.dom.rankChartPowerMaxValue.disabled = true;
        return;
      }
      const min = cached[0];
      const max = cached[cached.length - 1];
      this.state.rankChartPowerDomain = { min, max, values: cached };
      const selected = powers || parsePowerRangeInput(this.dom.rankChartPowerRangeInput.value);
      let low = selected?.length >= 2 ? Math.max(min, Math.min(max, selected[0])) : min;
      let high = selected?.length >= 2 ? Math.max(min, Math.min(max, selected[selected.length - 1])) : max;
      if (low >= high) { low = min; high = max; }
      this.state.rankChartPowerSelection = [low, high];
      if (!powers && (!selected || selected.length < 2 || low !== selected[0] || high !== selected[selected.length - 1])) {
        this.dom.rankChartPowerRangeInput.value = `${formatPowerInputValue(low)}-${formatPowerInputValue(high)}`;
      }
      this.updateRankChartPowerSlider();
    }

    updateRankChartPowerSlider({ forceText = false } = {}) {
      const domain = this.state.rankChartPowerDomain;
      if (!domain || !this.state.rankChartPowerSelection) return;
      const [low, high] = this.state.rankChartPowerSelection;
      [this.dom.rankChartPowerMin, this.dom.rankChartPowerMax].forEach((slider, index) => {
        const power = index ? high : low;
        slider.value = String(Math.round(this.rankChartPowerPosition(power)));
        slider.setAttribute("aria-valuemin", String(domain.min));
        slider.setAttribute("aria-valuemax", String(domain.max));
        slider.setAttribute("aria-valuenow", String(power));
        slider.setAttribute("aria-valuetext", formatPowerLabel(power));
        slider.disabled = this.state.busy || this.state.exportingRankChartsImage;
      });
      [this.dom.rankChartPowerMinValue, this.dom.rankChartPowerMaxValue].forEach((input, index) => {
        input.disabled = this.state.busy || this.state.exportingRankChartsImage;
        if (forceText || document.activeElement !== input) {
          input.value = formatPowerInputValue(index ? high : low);
          input.removeAttribute("aria-invalid");
        }
      });
      const left = this.rankChartPowerPosition(low) / 100;
      const right = this.rankChartPowerPosition(high) / 100;
      this.dom.rankChartPowerRangeFill.style.left = `${left}%`;
      this.dom.rankChartPowerRangeFill.style.width = `${right - left}%`;
      this.renderRankChartPowerTicks();
    }

    handleRankChartPowerBounds(final = false) {
      window.clearTimeout(this.state.rankChartInputTimer);
      const domain = this.state.rankChartPowerDomain;
      if (!domain || this.state.busy || this.state.exportingRankChartsImage) return;
      const low = parsePowerInput(this.dom.rankChartPowerMinValue.value);
      const high = parsePowerInput(this.dom.rankChartPowerMaxValue.value);
      if (!low || !high || low < domain.min || high > domain.max || low >= high) {
        if (final) {
          this.dom.rankChartPowerMinValue.setAttribute("aria-invalid", "true");
          this.dom.rankChartPowerMaxValue.setAttribute("aria-invalid", "true");
          this.setRankChartStatus(this.t("rankChartInvalidSelection"), true);
        }
        return;
      }
      const snap = (power) => domain.values.reduce((best, value) => Math.abs(value - power) < Math.abs(best - power) ? value : best);
      const selected = [snap(low), snap(high)];
      if (selected[0] >= selected[1]) return;
      this.state.rankChartPowerSelection = selected;
      this.dom.rankChartPowerRangeInput.value = `${formatPowerInputValue(selected[0])}-${formatPowerInputValue(selected[1])}`;
      this.updateRankChartPowerSlider({ forceText: final });
      this.handleRenderRankChart({ preview: true });
    }

    renderRankChartPowerTicks() {
      const domain = this.state.rankChartPowerDomain;
      if (!domain) return;
      const ticks = [domain.min];
      const minDistance = Math.min(2500, 56 / Math.max(1, this.dom.rankChartPowerSlider.clientWidth - 16) * 10000);
      for (let unit = 10 ** Math.floor(Math.log10(domain.min)); unit <= domain.max; unit *= 10) {
        for (const multiple of [1, 2, 5]) {
          const value = unit * multiple;
          const position = this.rankChartPowerPosition(value);
          if (value > domain.min && value < domain.max && position - this.rankChartPowerPosition(ticks[ticks.length - 1]) >= minDistance && 10000 - position >= minDistance) ticks.push(value);
        }
      }
      ticks.push(domain.max);
      this.dom.rankChartPowerTicks.replaceChildren();
      for (const value of ticks) {
        const label = document.createElement("span");
        label.textContent = formatPowerInputValue(value);
        label.style.left = `${this.rankChartPowerPosition(value) / 100}%`;
        this.dom.rankChartPowerTicks.appendChild(label);
      }
    }

    handleRankChartPowerSlider(index, position) {
      const domain = this.state.rankChartPowerDomain;
      if (!domain || this.state.busy || this.state.exportingRankChartsImage) return;
      const raw = domain.min * Math.exp(Math.log(domain.max / domain.min) * position / 10000);
      const nearest = domain.values.reduce((best, value) => Math.abs(Math.log(value / raw)) < Math.abs(Math.log(best / raw)) ? value : best);
      const selected = [...this.state.rankChartPowerSelection];
      if (index === 0) selected[0] = Math.min(nearest, domain.values.filter((value) => value < selected[1]).at(-1) ?? domain.min);
      else selected[1] = Math.max(nearest, domain.values.find((value) => value > selected[0]) ?? domain.max);
      this.state.rankChartPowerSelection = selected;
      this.dom.rankChartPowerRangeInput.value = `${formatPowerInputValue(selected[0])}-${formatPowerInputValue(selected[1])}`;
      this.updateRankChartPowerSlider();
      this.scheduleRankChartInputRender(80);
    }

    handleRankChartPowerSliderKeydown(event, index) {
      const domain = this.state.rankChartPowerDomain;
      if (!domain || this.state.busy || this.state.exportingRankChartsImage) return;
      const current = domain.values.reduce((best, value, i) => Math.abs(Math.log(value / this.state.rankChartPowerSelection[index])) <
        Math.abs(Math.log(domain.values[best] / this.state.rankChartPowerSelection[index])) ? i : best, 0);
      let target;
      if (["ArrowLeft", "ArrowDown"].includes(event.key)) target = current - (event.shiftKey ? 5 : 1);
      else if (["ArrowRight", "ArrowUp"].includes(event.key)) target = current + (event.shiftKey ? 5 : 1);
      else if (event.key === "PageDown") target = current - 5;
      else if (event.key === "PageUp") target = current + 5;
      else if (event.key === "Home") target = 0;
      else if (event.key === "End") target = domain.values.length - 1;
      else return;
      event.preventDefault();
      const value = domain.values[Math.max(0, Math.min(domain.values.length - 1, target))];
      this.handleRankChartPowerSlider(index, this.rankChartPowerPosition(value));
      this.handleRenderRankChart({ preview: true });
    }

    buildCachedPowerOptionLabel(power) {
      const cache = this.cacheStore.readByPower(power);
      const dateText = cache && cache.requestedAt ? this.formatDateTime(cache.requestedAt) : this.t("unknownDate");
      return `${formatPowerLabel(power)} (${dateText})`;
    }

    scheduleRankChartInputRender(delay = 250) {
      window.clearTimeout(this.state.rankChartInputTimer);
      this.state.rankChartInputTimer = window.setTimeout(() => this.handleRenderRankChart({ preview: true }), delay);
    }

    handleRenderRankChart({ preview = false, useLastValidPower = false } = {}) {
      window.clearTimeout(this.state.rankChartInputTimer);
      if (this.dom.rankChartPage.hidden || this.state.busy || this.state.exportingRankChartsImage) return;
      if (!preview && !this.commitRankChartKingdomEntry()) return;
      const kingdomSpec = preview
        ? `${this.dom.rankChartKingdomInput.value},${this.dom.rankChartKingdomEntryInput.value}`
        : this.dom.rankChartKingdomInput.value;
      let rangeText = this.dom.rankChartPowerRangeInput.value.trim();
      const rangePowers = rangeText ? parsePowerRangeInput(rangeText) : null;
      if (useLastValidPower && rangeText && (!rangePowers || rangePowers.length < 2) && this.state.rankChartSourceResult) {
        rangeText = this.state.rankChartSourceResult.powerSpec;
      }
      const result = this.buildRankChartDataFromInputs({ kingdomSpec, rangeText, silent: preview });
      if (!result) {
        const selection = parseRankChartKingdomSelection(kingdomSpec);
        if (parsePowerRangeInput(rangeText)?.length > 1 && (!kingdomSpec.replace(/[,\s]/g, "") || selection.kingdomIds.length)) {
          this.updateRankChartUrl(rangeText, selection.kingdomIds, selection.hiddenKingdomIds);
        }
        return;
      }

      this.applyRankChartVisibility(result, { renderTags: !preview });
    }

    applyRankChartVisibility(result, { renderTags = true } = {}) {
      this.state.rankChartSourceResult = result;
      const hidden = new Set(result.hiddenKingdomIds);
      this.renderRankChart({ ...result, charts: result.charts.filter((chart) => !hidden.has(chart.kingdomId)) });
      this.updateRankChartUrl(result.powerSpec, result.kingdomIds, result.hiddenKingdomIds);
      this.syncRankChartPowerSlider(result.powers);
      if (renderTags) this.renderRankChartKingdomToggles(result);
      this.setRankChartStatus("");
      this.updateRankChartActionButtonsDisabledState();
    }

    renderRankChartKingdomToggles(result) {
      const group = this.dom.rankChartKingdomToggles;
      const hidden = new Set(result.hiddenKingdomIds);
      group.replaceChildren();
      result.kingdomIds.forEach((kingdomId) => {
        const tag = document.createElement("span");
        tag.className = `rank-chart-kingdom-tag${hidden.has(kingdomId) ? " is-off" : ""}`;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "rank-chart-kingdom-toggle";
        button.dataset.rankChartKingdom = String(kingdomId);
        button.textContent = String(kingdomId);
        button.setAttribute("aria-pressed", String(!hidden.has(kingdomId)));
        button.title = this.t("rankChartToggleKingdom", { kingdom: kingdomId });
        tag.appendChild(button);
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "rank-chart-kingdom-remove";
        remove.dataset.removeRankChartKingdom = String(kingdomId);
        remove.textContent = "×";
        remove.setAttribute("aria-label", this.t("rankChartRemoveKingdom", { kingdom: kingdomId }));
        tag.appendChild(remove);
        group.appendChild(tag);
      });
    }

    commitRankChartKingdomEntry() {
      const input = this.dom.rankChartKingdomEntryInput;
      const raw = input.value.trim();
      if (!raw) return true;
      const added = parseRankChartKingdomSelection(raw);
      if (!added.kingdomIds.length) {
        input.setAttribute("aria-invalid", "true");
        this.setRankChartStatus(this.t("rankChartInvalidKingdom"), true);
        return false;
      }
      const current = parseRankChartKingdomSelection(this.dom.rankChartKingdomInput.value);
      const kingdomIds = [...new Set([...current.kingdomIds, ...added.kingdomIds])];
      const hiddenKingdomIds = [...new Set([...current.hiddenKingdomIds, ...added.hiddenKingdomIds])];
      this.setRankChartKingdomSelection({ kingdomIds, hiddenKingdomIds });
      input.value = "";
      input.removeAttribute("aria-invalid");
      this.dom.rankChartKingdomField.scrollLeft = this.dom.rankChartKingdomField.scrollWidth;
      return true;
    }

    setRankChartKingdomSelection(selection) {
      const hidden = new Set(selection.hiddenKingdomIds);
      this.dom.rankChartKingdomInput.value = selection.kingdomIds.map((id) => `${hidden.has(id) ? "!" : ""}${id}`).join(",");
      this.renderRankChartKingdomToggles(selection);
    }

    handleToggleRankChartKingdom(kingdomId) {
      const result = parseRankChartKingdomSelection(this.dom.rankChartKingdomInput.value);
      if (this.state.busy || this.state.exportingRankChartsImage || !result.kingdomIds.includes(kingdomId)) return;
      const hidden = new Set(result.hiddenKingdomIds);
      if (hidden.has(kingdomId)) hidden.delete(kingdomId);
      else hidden.add(kingdomId);
      const hiddenKingdomIds = result.kingdomIds.filter((id) => hidden.has(id));
      this.setRankChartKingdomSelection({ ...result, hiddenKingdomIds });
      this.handleRenderRankChart({ useLastValidPower: true });
      this.dom.rankChartKingdomToggles.querySelector(`[data-rank-chart-kingdom="${kingdomId}"]`).focus({ preventScroll: true });
    }

    handleRemoveRankChartKingdom(kingdomId) {
      if (this.state.busy || this.state.exportingRankChartsImage) return;
      const current = parseRankChartKingdomSelection(this.dom.rankChartKingdomInput.value);
      const kingdomIds = current.kingdomIds.filter((id) => id !== kingdomId);
      this.setRankChartKingdomSelection({ kingdomIds, hiddenKingdomIds: current.hiddenKingdomIds.filter((id) => id !== kingdomId) });
      if (kingdomIds.length) this.handleRenderRankChart({ useLastValidPower: true });
      else {
        this.state.rankChartSourceResult = null;
        this.renderRankChart({ labels: [], powers: [], charts: [] });
        this.updateRankChartUrl(this.dom.rankChartPowerRangeInput.value, []);
        this.setRankChartStatus("");
        this.updateRankChartActionButtonsDisabledState();
      }
      this.dom.rankChartKingdomEntryInput.focus({ preventScroll: true });
    }

    async handleRefreshRankChartSelectedCache() {
      const selectedPowers = [...this.dom.rankChartPowerList.selectedOptions]
        .map((option) => Number(option.value))
        .filter((value) => Number.isFinite(value) && value > 0)
        .sort((a, b) => a - b);
      if (selectedPowers.length === 0) {
        this.setRankChartStatus(this.t("rankChartRefreshSelectRequired"), true);
        return;
      }

      this.setBusy(true);
      try {
        for (let index = 0; index < selectedPowers.length; index += 1) {
          const power = selectedPowers[index];
          this.setRankChartStatus(this.t("rankChartRefreshLoading", {
            index: index + 1,
            count: selectedPowers.length,
          }));
          const requestPlan = this.api.buildRequestPlan(power);
          const list = await this.api.fetchKingdomList(power);
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
            kingdomList: this.filter.normalizeList(list),
          });
        }
        this.refreshPowerOptions();
        this.renderRankChartPowerOptions(selectedPowers);
        this.setRankChartStatus(this.t("rankChartRefreshDone", { count: selectedPowers.length }));
      } catch (error) {
        console.error(error);
        const message = String(error && error.message ? error.message : this.t("unknownError"));
        this.setRankChartStatus(this.t("rankChartRefreshFailed", { message }), true);
      } finally {
        this.setBusy(false);
      }
    }

    handleSelectRankChartType(type) {
      if (this.state.exportingRankChartsImage || !["bar", "line", "heatmap-h", "heatmap-v"].includes(type)) return;
      this.state.rankChartType = type;
      this.updateRankChartTabs();
      this.updateRankChartUrl();
      if (this.state.rankCharts.length > 0) {
        this.renderRankChart(this.state.rankChartLastResult);
      }
    }

    handleRankChartTabKeydown(event) {
      const tabs = this.dom.rankChartTabButtons;
      const index = tabs.indexOf(event.currentTarget);
      const rtl = document.documentElement.dir === "rtl";
      const direction = event.key === "ArrowRight" ? (rtl ? -1 : 1) : (rtl ? 1 : -1);
      let next;
      if (event.key === "Home") next = 0;
      else if (event.key === "End") next = tabs.length - 1;
      else if (event.key === "ArrowRight" || event.key === "ArrowLeft") next = (index + direction + tabs.length) % tabs.length;
      else return;
      event.preventDefault();
      if (tabs[next].disabled) return;
      tabs[next].focus();
      this.handleSelectRankChartType(tabs[next].dataset.chartType);
    }

    updateRankChartTabs() {
      if (!this.dom || !this.dom.rankChartTabButtons) return;
      this.dom.rankChartTabs.setAttribute("aria-label", this.t("rankChartTabs"));
      const keys = ["rankChartTabBar", "rankChartTabLine", "rankChartTabHeatmapH", "rankChartTabHeatmapV"];
      this.dom.rankChartTabButtons.forEach((tab, index) => {
        const selected = tab.dataset.chartType === this.state.rankChartType;
        tab.textContent = this.t(keys[index]);
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
        if (index >= 2) tab.title = this.t(index === 2 ? "rankChartHeatmapH" : "rankChartHeatmapV");
        if (selected) this.dom.rankChartCanvasList.setAttribute("aria-labelledby", tab.id);
      });
      this.dom.rankChartSortControl.hidden = false;
      this.dom.rankChartSortSelect.disabled = this.state.busy || this.state.exportingRankChartsImage;
      this.dom.rankChartSortLabel.textContent = this.t("rankChartSort");
      const sortKeys = ["rankChartSortKingdomAsc", "rankChartSortKingdomDesc", "rankChartSortTotalDesc", "rankChartSortTotalAsc", "rankChartSortAverageDesc", "rankChartSortAverageAsc"];
      [...this.dom.rankChartSortSelect.options].forEach((option, index) => {
        option.textContent = this.t(sortKeys[index]);
      });
      this.dom.rankChartSortSelect.value = this.state.rankChartSort;
    }

    updateRankChartActionButtonLabels() {
      this.updateRankChartTabs();
      this.setIconButtonContent(this.dom.exportRankChartsImageButton, {
        icon: "image-down",
        label: this.t("rankChartExportImage"),
      });
      this.renderLucideIcons();
    }

    setIconButtonContent(button, { icon, label, iconOnly = false }) {
      if (!button) return;
      button.innerHTML = "";
      const iconSpan = document.createElement("span");
      iconSpan.className = "rank-chart-button-icon";
      iconSpan.setAttribute("data-lucide", icon);
      button.appendChild(iconSpan);

      button.setAttribute("aria-label", label);
      button.setAttribute("title", label);
      if (iconOnly) return;

      const labelSpan = document.createElement("span");
      labelSpan.className = "rank-chart-button-label";
      labelSpan.textContent = label;
      button.appendChild(labelSpan);
    }

    renderLucideIcons() {
      if (!window.lucide || typeof window.lucide.createIcons !== "function") return;
      window.lucide.createIcons({
        attrs: {
          "aria-hidden": "true",
          focusable: "false",
        },
      });
    }

    async handleExportRankChartsImage() {
      if (this.state.exportingRankChartsImage) return;
      if (this.state.rankCharts.length === 0 || this.dom.rankChartCanvasList.children.length === 0) {
        this.setRankChartStatus(this.t("rankChartExportNoCharts"), true);
        return;
      }
      if (typeof window.html2canvas !== "function") {
        this.setRankChartStatus(this.t("rankChartExportLibraryMissing"), true);
        return;
      }

      this.state.exportingRankChartsImage = true;
      this.updateRankChartActionButtonsDisabledState();
      this.setRankChartStatus(this.t("rankChartExportPreparing"));

      const snapshot = this.state.rankChartLastResult;
      if (!snapshot || !snapshot.labels || !snapshot.charts || snapshot.charts.length === 0) {
        this.setRankChartStatus(this.t("rankChartExportNoCharts"), true);
        this.state.exportingRankChartsImage = false;
        this.updateRankChartActionButtonsDisabledState();
        return;
      }

      try {
        if (window.MigrationHeatmap.isHeatmap(this.state.rankChartType)) {
          await this.exportHeatmapImages(snapshot);
        } else if (snapshot.charts.length >= this.config.imageExport.rankChartsPerZipImage) {
          if (typeof window.JSZip !== "function") {
            this.setRankChartStatus(this.t("rankChartExportLibraryMissing"), true);
            return;
          }
          await this.exportRankChartsZip(snapshot);
        } else {
          await this.exportRankChartsPng(snapshot);
        }
        this.setRankChartStatus(this.t("rankChartExportDone"));
      } catch (error) {
        console.error(error);
        const message = String(error && error.message ? error.message : this.t("unknownError"));
        this.setRankChartStatus(this.t("rankChartExportFailed", { message }), true);
      } finally {
        this.state.exportingRankChartsImage = false;
        this.updateRankChartActionButtonsDisabledState();
      }
    }

    async exportRankChartsPng(snapshot) {
      const { container, tempCharts } = this.createVirtualRankChartExportContainer(snapshot);
      document.body.appendChild(container);
      try {
        const canvas = await this.renderElementToCanvas(container);
        const blob = await this.canvasToBlob(canvas);
        this.downloadBlob(blob, this.buildRankChartExportFileName());
      } finally {
        this.destroyVirtualRankCharts(container, tempCharts);
      }
    }

    heatmapPages(snapshot, forDisplay = false) {
      return window.MigrationHeatmap.pages(snapshot, this.state.rankChartType,
        forDisplay ? snapshot.charts.length : this.config.imageExport.heatmapKingdomsPerImage,
        forDisplay ? snapshot.labels.length : this.config.imageExport.heatmapBandsPerImage,
        this.state.rankChartSort);
    }

    async exportHeatmapImages(snapshot) {
      const pages = this.heatmapPages(snapshot);
      if (pages.length === 1) {
        await this.exportRankChartsPng(snapshot);
        return;
      }
      if (typeof window.JSZip !== "function") throw new Error(this.t("rankChartExportLibraryMissing"));
      const zip = new window.JSZip();
      for (let index = 0; index < pages.length; index += 1) {
        const { container, tempCharts } = this.createVirtualRankChartExportContainer(snapshot, { heatmapPage: pages[index] });
        document.body.appendChild(container);
        try {
          const canvas = await this.renderElementToCanvas(container);
          zip.file(this.buildRankChartExportPartFileName(index + 1), await this.canvasToBlob(canvas));
        } finally {
          this.destroyVirtualRankCharts(container, tempCharts);
        }
      }
      this.downloadBlob(await zip.generateAsync({ type: "blob" }), this.buildRankChartExportZipFileName());
    }

    createHeatmap(canvas, snapshot, page, width, interactive) {
      const theme = this.themeManager.getTheme(this.dom.themeSelect.value);
      const { h, s, l } = this.themeManager.parseHsl(theme.$primary);
      const first = snapshot.labels[0]?.split(" - ")[0] || "";
      const last = snapshot.labels[snapshot.labels.length - 1]?.split(" - ")[1] || "";
      return new window.MigrationHeatmap(canvas, page, {
        type: this.state.rankChartType,
        width,
        scale: interactive ? Math.min(window.devicePixelRatio || 1, 2) : this.config.imageExport.captureScale,
        interactive,
        primary: this.themeManager.hslToRgb(h, s, Math.min(l, 42)),
        palette: this.getExportPalette(),
        maxCount: window.MigrationHeatmap.maxCount(snapshot),
        maxTotal: Math.max(0, ...snapshot.charts.map((chart) => chart.counts.reduce((sum, count) => sum + count, 0))),
        title: this.t("rankChartTitle"),
        description: `${this.t("rankChartHeatmapDescription", { from: first, to: last, count: snapshot.charts.length })} / ${this.t(this.state.rankChartType === "heatmap-h" ? "rankChartTabHeatmapH" : "rankChartTabHeatmapV")}`,
        totalLabel: this.t("rankChartHeatmapTotal"),
        summaryLabel: this.t("rankChartHeatmapSummary"),
        averageLabel: this.t("rankChartAverage"),
        averageUnavailable: this.t("rankChartAverageUnavailable"),
        averageNote: this.t("rankChartAverageNote"),
        fromPower: snapshot.powers?.[0],
        toPower: snapshot.powers?.[snapshot.powers.length - 1],
        pagePowers: page.powers,
        countLabel: this.t("rankChartYAxis"),
        zeroLabel: this.t("rankChartHeatmapZero"),
        unavailableLabel: this.t("rankChartHeatmapUnavailable"),
        kingdomLabel: this.t("sortKingdom"),
        footnote: this.t("rankChartHeatmapNote"),
      });
    }

    async exportRankChartsZip(snapshot) {
      const zip = new window.JSZip();
      const chunks = this.chunkRankCharts(snapshot.charts);
      for (let index = 0; index < chunks.length; index += 1) {
        const charts = chunks[index];
        const { container, tempCharts } = this.createVirtualRankChartExportContainer(snapshot, {
          charts,
          startIndex: index * this.config.imageExport.rankChartsPerZipImage,
        });
        document.body.appendChild(container);
        try {
          const canvas = await this.renderElementToCanvas(container);
          const blob = await this.canvasToBlob(canvas);
          zip.file(this.buildRankChartExportPartFileName(index + 1), blob);
        } finally {
          this.destroyVirtualRankCharts(container, tempCharts);
        }
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      this.downloadBlob(zipBlob, this.buildRankChartExportZipFileName());
    }

    chunkRankCharts(charts) {
      const chunkSize = this.config.imageExport.rankChartsPerZipImage;
      const chunks = [];
      for (let index = 0; index < charts.length; index += chunkSize) {
        chunks.push(charts.slice(index, index + chunkSize));
      }
      return chunks;
    }

    destroyVirtualRankCharts(container, tempCharts) {
      for (const chart of tempCharts) {
        chart.destroy();
      }
      container.remove();
    }

    downloadBlob(blob, fileName) {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }

    createVirtualRankChartExportContainer(snapshot, options = {}) {
      if (window.MigrationHeatmap.isHeatmap(this.state.rankChartType)) {
        const container = document.createElement("div");
        container.style.cssText = `position:fixed;left:-100000px;top:0;width:${this.config.imageExport.rankChartsWidth}px;`;
        const canvas = document.createElement("canvas");
        container.appendChild(canvas);
        const chart = this.createHeatmap(canvas, snapshot, options.heatmapPage || this.heatmapPages(snapshot)[0],
          this.config.imageExport.rankChartsWidth, false);
        return { container, tempCharts: [chart] };
      }
      const palette = this.getExportPalette();
      const yAxisMax = this.calculateRankChartYAxisMax(snapshot.charts);
      const charts = options.charts || snapshot.charts;
      const startIndex = Number.isFinite(options.startIndex) ? options.startIndex : 0;
      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.left = "-100000px";
      container.style.top = "0";
      container.style.width = `${this.config.imageExport.rankChartsWidth}px`;
      container.style.padding = "18px";
      container.style.background = "#ffffff";
      container.style.boxSizing = "border-box";

      const list = document.createElement("div");
      list.style.display = "grid";
      list.style.gap = "16px";
      list.style.gridAutoRows = "minmax(440px, 440px)";
      container.appendChild(list);

      const tempCharts = [];
      charts.forEach((chartResult, localIndex) => {
        const index = startIndex + localIndex;
        const wrap = document.createElement("div");
        wrap.className = "rank-chart-canvas-wrap";
        wrap.style.height = "440px";
        wrap.style.minHeight = "440px";
        const canvas = document.createElement("canvas");
        canvas.width = this.config.imageExport.rankChartsWidth - 76;
        canvas.height = 420;
        wrap.appendChild(canvas);
        list.appendChild(wrap);

        const chart = new window.Chart(
          canvas,
          this.buildRankChartConfig({
            labels: snapshot.labels,
            powers: snapshot.powers,
            chartResult,
            index,
            yAxisMax,
            palette,
            responsive: false,
            maintainAspectRatio: false,
            animation: false,
          })
        );
        tempCharts.push(chart);
      });

      return { container, tempCharts };
    }

    buildRankChartDataFromInputs({ kingdomSpec = this.dom.rankChartKingdomInput.value,
      rangeText = this.dom.rankChartPowerRangeInput.value.trim(), silent = false } = {}) {
      if (!window.Chart) {
        if (!silent) this.setRankChartStatus(this.t("rankChartLibraryMissing"), true);
        return null;
      }

      const { kingdomIds, hiddenKingdomIds } = parseRankChartKingdomSelection(kingdomSpec);
      if (kingdomIds.length === 0) {
        if (!silent) this.setRankChartStatus(this.t("rankChartInvalidKingdom"), true);
        return null;
      }

      const rangePowers = rangeText ? parsePowerRangeInput(rangeText) : null;
      if (rangeText && (!rangePowers || rangePowers.length < 2)) {
        if (!silent) this.setRankChartStatus(this.t("rankChartInvalidSelection"), true);
        return null;
      }
      const selectedPowers = [...this.dom.rankChartPowerList.selectedOptions]
        .map((option) => Number(option.value))
        .filter((value) => Number.isFinite(value));
      const powers = rangePowers && rangePowers.length > 0 ? rangePowers : selectedPowers;
      const selectedOrRangedPowers = [...new Set(powers)].sort((a, b) => a - b);
      if (selectedOrRangedPowers.length < 2) {
        if (!silent) this.setRankChartStatus(this.t("rankChartInvalidSelection"), true);
        return null;
      }
      const normalizedPowers = this.expandPowersToHundredMillionSteps(selectedOrRangedPowers);
      const average = this.cacheStore.getAverage(normalizedPowers);

      const listsByPower = new Map();
      for (const power of normalizedPowers) {
        const cache = this.cacheStore.readByPower(power);
        listsByPower.set(power, cache && cache.kingdomList ? this.filter.normalizeList(cache.kingdomList) : null);
      }

      const labels = normalizedPowers.slice(0, -1).map((power, index) =>
        `${formatPowerLabel(power)} - ${formatPowerLabel(normalizedPowers[index + 1])}`
      );
      const charts = [];
      let hasAnyCache = false;
      for (const kingdomId of kingdomIds) {
        const entries = normalizedPowers.map((power) => {
          const list = listsByPower.get(power);
          if (!list) return { power, rank: 0, hasCache: false };
          hasAnyCache = true;
          const row = list.find((item) => Number(item.kingdomId) === kingdomId);
          return {
            power,
            rank: row ? Number(row.rank) : 0,
            hasCache: true,
          };
        });
        const counts = [];
        const available = [];
        for (let index = 0; index < entries.length - 1; index += 1) {
          const current = entries[index];
          const next = entries[index + 1];
          const count =
            current.hasCache && next.hasCache && current.rank > 0 && next.rank > 0
              ? Math.abs(next.rank - current.rank)
              : 0;
          counts.push(count);
          available.push(current.hasCache && next.hasCache && current.rank > 0 && next.rank > 0);
        }
        charts.push({ kingdomId, counts, available, average: average.values[String(kingdomId)] ?? null });
      }

      if (!hasAnyCache || labels.length === 0 || charts.length === 0) {
        if (!silent) this.setRankChartStatus(this.t("rankChartNoData"), true);
        return null;
      }

      return {
        labels,
        powers: normalizedPowers,
        charts,
        kingdomIds,
        hiddenKingdomIds,
        powerSpec: rangeText || selectedOrRangedPowers.map((value) => formatPowerInputValue(value)).join(","),
      };
    }

    expandPowersToHundredMillionSteps(powers) {
      const sorted = [...new Set(powers)]
        .filter((value) => Number.isFinite(value) && value > 0)
        .sort((a, b) => a - b);
      if (sorted.length < 2) return sorted;

      const min = sorted[0];
      const max = sorted[sorted.length - 1];
      const expanded = [];
      const first = Math.ceil(min / 100) * 100;
      for (let value = first; value <= max; value += 100) {
        expanded.push(value);
      }
      return expanded;
    }

    renderRankChart(result) {
      const palette = this.getExportPalette();
      const yAxisMax = this.calculateRankChartYAxisMax(result.charts);
      this.state.rankChartLastResult = {
        labels: [...result.labels],
        powers: result.powers ? [...result.powers] : [],
        charts: window.MigrationHeatmap.orderedCharts(result.charts, this.state.rankChartSort).map((item) => ({
          kingdomId: item.kingdomId,
          counts: [...item.counts],
          available: item.available ? [...item.available] : undefined,
          average: item.average ?? null,
        })),
      };
      for (const chart of this.state.rankCharts) {
        chart.destroy();
      }
      this.state.rankCharts = [];
      this.dom.rankChartCanvasList.innerHTML = "";
      const isHeatmap = window.MigrationHeatmap.isHeatmap(this.state.rankChartType);
      this.dom.rankChartCanvasList.classList.toggle("is-heatmap", isHeatmap);
      if (result.charts.length === 0) return;
      if (isHeatmap) {
        const snapshot = this.state.rankChartLastResult;
        const width = Math.max(900, this.dom.rankChartCanvasList.clientWidth - 2);
        for (const page of this.heatmapPages(snapshot, true)) {
          const wrap = document.createElement("div");
          wrap.className = "rank-heatmap-wrap";
          const canvas = document.createElement("canvas");
          wrap.appendChild(canvas);
          this.dom.rankChartCanvasList.appendChild(wrap);
          this.state.rankCharts.push(this.createHeatmap(canvas, snapshot, page, width, true));
        }
        return;
      }

      this.state.rankChartLastResult.charts.forEach((chartResult, index) => {
        const wrap = document.createElement("div");
        wrap.className = "rank-chart-canvas-wrap";
        const canvas = document.createElement("canvas");
        wrap.appendChild(canvas);
        this.dom.rankChartCanvasList.appendChild(wrap);
        const chart = new window.Chart(
          canvas,
          this.buildRankChartConfig({
            labels: result.labels,
            powers: result.powers,
            chartResult,
            index,
            yAxisMax,
            palette,
            responsive: true,
            maintainAspectRatio: false,
            animation: true,
          })
        );
        this.state.rankCharts.push(chart);
      });
    }

    buildRankChartConfig({
      labels,
      powers,
      chartResult,
      index,
      yAxisMax,
      palette,
      responsive,
      maintainAspectRatio,
      animation,
    }) {
      return {
        type: this.state.rankChartType,
        plugins: [{
          id: "migrationAverage",
          afterDraw: (chart) => {
            if (!Number.isFinite(chartResult.average) || !powers?.length) return;
            const { ctx, chartArea, scales } = chart;
            const index = (chartResult.average - powers[0]) / 100 - 0.5;
            const x = scales.x.getPixelForValue(index);
            if (x < chartArea.left || x > chartArea.right) return;
            const label = `${this.t("rankChartAverage")}: ${(chartResult.average / 1000).toFixed(2)} B`;
            ctx.save();
            const markerTop = chartArea.top + 24;
            const markerHeight = Math.max(0, chartArea.bottom - markerTop);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(x - 3, markerTop, 6, markerHeight);
            ctx.fillStyle = palette.strong;
            ctx.fillRect(x - 1.5, markerTop, 3, markerHeight);
            ctx.font = "12px system-ui, sans-serif";
            const width = ctx.measureText(label).width;
            const labelX = Math.max(chartArea.left + 4, Math.min(x - width / 2, chartArea.right - width - 4));
            ctx.fillStyle = palette.background;
            ctx.fillRect(labelX - 3, chartArea.top + 2, width + 6, 18);
            ctx.fillStyle = palette.strong;
            ctx.textAlign = "left";
            ctx.fillText(label, labelX, chartArea.top + 15);
            ctx.restore();
          },
        }],
        data: {
          labels,
          datasets: [
            {
              label: this.t("rankChartDatasetLabel"),
              data: chartResult.counts,
              backgroundColor: this.rankChartColor(index, 0.72),
              borderColor: this.rankChartColor(index, 1),
              borderWidth: 1,
              fill: this.state.rankChartType === "line" ? false : undefined,
              tension: this.state.rankChartType === "line" ? 0.28 : undefined,
            },
          ],
        },
        options: {
          responsive,
          maintainAspectRatio,
          animation,
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: true,
              text: `${this.t("rankChartTitle")} K${chartResult.kingdomId}`,
              color: palette.strong,
              font: {
                size: 16,
                weight: "700",
              },
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: this.t("rankChartXAxis"),
                color: palette.strong,
              },
              ticks: {
                color: palette.strong,
              },
              grid: {
                color: palette.border,
              },
            },
            y: {
              beginAtZero: true,
              suggestedMax: yAxisMax,
              max: yAxisMax,
              ticks: {
                precision: 0,
                color: palette.text,
              },
              title: {
                display: true,
                text: this.t("rankChartYAxis"),
                color: palette.strong,
              },
              grid: {
                color: palette.border,
              },
            },
          },
        },
      };
    }

    calculateRankChartYAxisMax(charts) {
      const maxValue = Math.max(
        0,
        ...charts.flatMap((chart) => chart.counts).filter((value) => Number.isFinite(value))
      );
      if (maxValue <= 0) return undefined;
      return maxValue + 1;
    }

    rankChartColor(index, alpha) {
      const colors = [
        this.getPrimaryRgb(),
        "219, 85, 62",
        "47, 133, 90",
        "169, 104, 36",
        "110, 92, 191",
        "20, 132, 150",
        "196, 82, 128",
        "86, 102, 126",
      ];
      return `rgba(${colors[index % colors.length]}, ${alpha})`;
    }

    getPrimaryRgb() {
      const raw = window.getComputedStyle(document.documentElement).getPropertyValue("--bulma-primary-rgb").trim();
      return raw || "27, 79, 133";
    }

    setRankChartStatus(text, isError = false) {
      this.dom.rankChartStatusMessage.textContent = text;
      this.dom.rankChartStatus.hidden = !text;
      this.dom.rankChartStatus.classList.toggle("has-text-danger", isError);
    }

    updateRankChartActionButtonsDisabledState(forceDisabled = false) {
      const disabled = forceDisabled || this.state.busy || this.state.exportingRankChartsImage;
      for (const tab of this.dom.rankChartTabButtons) tab.disabled = Boolean(disabled);
      this.dom.exportRankChartsImageButton.disabled = Boolean(disabled || this.state.rankChartLastResult?.charts.length === 0);
      for (const button of this.dom.rankChartKingdomToggles.querySelectorAll("button")) button.disabled = Boolean(disabled);
      this.dom.rankChartPowerMin.disabled = Boolean(disabled || !this.state.rankChartPowerDomain);
      this.dom.rankChartPowerMax.disabled = Boolean(disabled || !this.state.rankChartPowerDomain);
      this.dom.rankChartPowerMinValue.disabled = Boolean(disabled || !this.state.rankChartPowerDomain);
      this.dom.rankChartPowerMaxValue.disabled = Boolean(disabled || !this.state.rankChartPowerDomain);
      for (const control of [this.dom.languageSelect, this.dom.themeSelect, this.dom.rankChartPowerList,
        this.dom.rankChartPowerRangeInput, this.dom.rankChartKingdomInput, this.dom.rankChartKingdomEntryInput,
        this.dom.refreshRankChartCacheButton, this.dom.rankChartSortSelect,
        this.dom.showKingdomInfoButton, this.dom.showRankDistributionButton]) {
        control.disabled = Boolean(disabled);
      }
      this.dom.rankChartCanvasList.setAttribute("aria-busy", String(Boolean(this.state.exportingRankChartsImage)));
    }

    buildRankChartExportFileName() {
      return `${this.buildRankChartExportBaseFileName()}.png`;
    }

    buildRankChartExportZipFileName() {
      return `${this.buildRankChartExportBaseFileName()}.zip`;
    }

    buildRankChartExportPartFileName(partNumber) {
      return `${this.buildRankChartExportBaseFileName()}-part-${String(partNumber).padStart(2, "0")}.png`;
    }

    buildRankChartExportBaseFileName() {
      const now = new Date();
      const yyyy = String(now.getFullYear()).padStart(4, "0");
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      const hh = String(now.getHours()).padStart(2, "0");
      const mi = String(now.getMinutes()).padStart(2, "0");
      return `ranking-charts-${this.state.rankChartType}-${yyyy}${mm}${dd}-${hh}${mi}`;
    }

    updateRankChartUrl(powerSpec, kingdomIds, hiddenKingdomIds = []) {
      if (!this.isRankingPath()) return;
      const url = new URL(window.location.href);
      const currentSelection = this.readRankChartUrlParams();
      const power = powerSpec === undefined ? currentSelection.powerSpec : powerSpec;
      const hidden = new Set(hiddenKingdomIds);
      const kingdoms = kingdomIds ? kingdomIds.map((id) => `${hidden.has(id) ? "!" : ""}${id}`).join(",") : currentSelection.kingdomSpec;
      url.pathname = this.buildRankingPath();
      if (power && power !== "select") url.searchParams.set("power", power);
      else url.searchParams.delete("power");
      if (kingdoms) url.searchParams.set("kingdom", kingdoms);
      else url.searchParams.delete("kingdom");
      for (const key of ["powers", "kingdoms"]) url.searchParams.delete(key);
      if (location.protocol === "file:") url.searchParams.set("view", "ranking");
      url.searchParams.set("tab", this.state.rankChartType);
      url.searchParams.set("sort", this.state.rankChartSort);
      const next = this.selectionUrl(url);
      const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (next !== current) window.history.replaceState(null, "", next);
    }

    buildRankingPath() {
      return location.protocol === "file:" ? location.pathname : "/ranking";
    }

    restoreRankChartFromUrl() {
      window.clearTimeout(this.state.rankChartInputTimer);
      this.showRankChartPage();
      const params = this.readRankChartUrlParams();
      this.state.rankChartType = params.chartType;
      this.state.rankChartSort = params.sort;
      this.updateRankChartTabs();
      this.updateRankChartUrl();
      const powerSpec = params.powerSpec;
      const kingdomSpec = params.kingdomSpec;
      if (!powerSpec || !kingdomSpec) {
        this.state.rankChartSourceResult = null;
        this.dom.rankChartKingdomToggles.replaceChildren();
      }
      this.dom.rankChartPowerRangeInput.value = powerSpec === "select" ? "" : powerSpec;
      this.dom.rankChartKingdomInput.value = kingdomSpec;
      this.dom.rankChartKingdomEntryInput.value = "";
      this.dom.rankChartKingdomEntryInput.removeAttribute("aria-invalid");
      this.renderRankChartKingdomToggles(parseRankChartKingdomSelection(kingdomSpec));
      const powers = parsePowerRangeInput(powerSpec) || [];
      this.renderRankChartPowerOptions(powers);
      if (powerSpec && kingdomSpec) this.handleRenderRankChart();
    }

    readRankChartUrlParams() {
      const search = new URLSearchParams(window.location.search || "");
      const chartType = search.get("tab");
      const sort = search.get("sort");
      const view = {
        chartType: ["bar", "line", "heatmap-h", "heatmap-v"].includes(chartType) ? chartType : "bar",
        sort: ["kingdom-asc", "kingdom-desc", "total-desc", "total-asc", "average-desc", "average-asc"].includes(sort) ? sort : "kingdom-asc",
      };
      const queryPower = search.get("power") || search.get("powers") || "";
      const queryKingdom = search.get("kingdom") || search.get("kingdoms") || "";
      if (queryPower || queryKingdom) {
        return {
          ...view,
          powerSpec: queryPower.trim(),
          kingdomSpec: queryKingdom.trim(),
        };
      }

      const path = String(window.location.pathname || "");
      const match = path.match(/^\/ranking(?:\/([^/]+)(?:\/([^/]+))?)?\/?$/);
      if (!match) return { ...view, powerSpec: "", kingdomSpec: "" };
      return {
        ...view,
        powerSpec: match[1] ? decodeURIComponent(match[1]).trim() : "",
        kingdomSpec: match[2] ? decodeURIComponent(match[2]).trim() : "",
      };
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

    extractKingdomCandidates(text, previousCandidate = null) {
      const matches = this.extractKingdomCandidateTokens(text);
      const values = [];
      let priorValue = Number.isFinite(previousCandidate) ? previousCandidate : null;
      for (let index = 0; index < matches.length; index += 1) {
        const token = matches[index];
        const nextHint = this.findNextKingdomCandidateHint(matches, index + 1);
        const value = this.normalizeKingdomCandidate(token, priorValue, nextHint);
        if (!Number.isFinite(value)) continue;
        values.push(value);
        priorValue = value;
      }

      return [...new Set(values)];
    }

    extractKingdomCandidateTokens(text) {
      const digitRuns = String(text || "").match(/\d{4,}/g) || [];
      const tokens = [];

      for (const run of digitRuns) {
        if (run.length === 4 || run.length === 5) {
          tokens.push(run);
          continue;
        }

        if (run.length % 4 === 0) {
          for (let offset = 0; offset < run.length; offset += 4) {
            tokens.push(run.slice(offset, offset + 4));
          }
        }
      }

      return tokens;
    }

    normalizeKingdomCandidate(token, previousCandidate = null, nextCandidateHint = null) {
      const text = String(token || "");
      if (!/^\d{4,5}$/.test(text)) return null;

      if (text.length === 4) {
        const value = Number(text);
        return this.isValidKingdomCandidate(value) ? value : null;
      }

      const frontValue = Number(text.slice(0, 4));
      const backValue = Number(text.slice(-4));
      const validFront = this.isValidKingdomCandidate(frontValue);
      const validBack = this.isValidKingdomCandidate(backValue);

      if (!validFront && !validBack) return null;
      if (!validFront) return backValue;
      if (!validBack) return frontValue;
      if (Number.isFinite(previousCandidate) && Number.isFinite(nextCandidateHint)) {
        const frontScore =
          Math.abs(frontValue - previousCandidate) + Math.abs(frontValue - nextCandidateHint);
        const backScore =
          Math.abs(backValue - previousCandidate) + Math.abs(backValue - nextCandidateHint);
        return frontScore <= backScore ? frontValue : backValue;
      }
      if (Number.isFinite(previousCandidate)) {
        const frontDistance = Math.abs(frontValue - previousCandidate);
        const backDistance = Math.abs(backValue - previousCandidate);
        return frontDistance <= backDistance ? frontValue : backValue;
      }
      if (Number.isFinite(nextCandidateHint)) {
        const frontDistance = Math.abs(frontValue - nextCandidateHint);
        const backDistance = Math.abs(backValue - nextCandidateHint);
        return frontDistance <= backDistance ? frontValue : backValue;
      }

      return backValue;
    }

    findNextKingdomCandidateHint(tokens, startIndex) {
      for (let index = startIndex; index < tokens.length; index += 1) {
        const hint = this.normalizeKingdomCandidate(tokens[index], null, null);
        if (Number.isFinite(hint)) return hint;
      }

      return null;
    }

    isValidKingdomCandidate(value) {
      return (
        Number.isFinite(value) &&
        value >= this.config.ocr.candidateMin &&
        value <= 9999
      );
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
      const powerRange = parsePowerRangeInput(this.dom.powerSelect.value);
      if (powerRange && powerRange.length > 1) {
        await this.handleBatchFetch(powerRange, forceRefresh);
        return;
      }

      const power = this.readPowerFromInput();
      if (!Number.isFinite(power)) return;
      const requestPlan = this.api.buildRequestPlan(power);
      this.setBusy(true);
      let succeeded = false;

      try {
        const cache = this.cacheStore.readByPower(power);
        if (!forceRefresh && this.cacheStore.isAvailable(cache, requestPlan)) {
          this.applyCacheResult(cache, power, requestPlan);
          succeeded = true;
          return;
        }

        this.setStatus(this.t("apiLoading"));
        const list = await this.api.fetchKingdomList(power);
        this.state.kingdomList = this.filter.normalizeList(list);
        this.resetFilters({ preservePageSize: true, preserveKingdomSelection: true, shouldRerender: false });

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
        succeeded = true;
      } catch (error) {
        console.error(error);
        this.setStatus(this.buildFetchErrorMessage(error), true);
        this.hideResults();
      } finally {
        this.setBusy(false);
        if (succeeded) this.finishSharedDataUpdate();
      }
    }

    finishSharedDataUpdate(powers) {
      if (powers?.length > 1) this.dom.rankChartPowerRangeInput.value = `${formatPowerInputValue(powers[0])}-${formatPowerInputValue(powers[powers.length - 1])}`;
      const selected = [...this.dom.rankChartPowerList.selectedOptions].map((option) => Number(option.value));
      this.renderRankChartPowerOptions(selected);
      this.dom.rankChartCacheOptions.open = this.readCachedPowerValues().length === 0;
      if (!this.dom.rankChartPage.hidden) this.handleRenderRankChart({ preview: true });
      else this.updateSearchSelectionUrl({ powerSpec: this.dom.rankChartPowerRangeInput.value });
    }

    async handleBatchFetch(powers, forceRefresh) {
      const normalizedPowers = [...new Set(powers)]
        .filter((value) => Number.isFinite(value) && value > 0)
        .sort((a, b) => a - b);
      if (normalizedPowers.length === 0) {
        this.setStatus(this.t("invalidPowerInput"), true);
        return;
      }

      this.setBusy(true);
      this.setStatus(this.t("batchFetchLoading", {
        from: formatPowerLabel(normalizedPowers[0]),
        to: formatPowerLabel(normalizedPowers[normalizedPowers.length - 1]),
        count: normalizedPowers.length,
      }));

      let latestCache = null;
      let latestPower = null;
      let succeeded = false;
      try {
        for (let index = 0; index < normalizedPowers.length; index += 1) {
          const power = normalizedPowers[index];
          const requestPlan = this.api.buildRequestPlan(power);
          const cached = this.cacheStore.readByPower(power);
          this.setStatus(this.t("batchFetchProgress", {
            power: formatPowerLabel(power),
            index: index + 1,
            count: normalizedPowers.length,
          }));

          if (!forceRefresh && this.cacheStore.isAvailable(cached, requestPlan)) {
            latestCache = cached;
            latestPower = power;
            continue;
          }

          const list = await this.api.fetchKingdomList(power);
          const normalizedList = this.filter.normalizeList(list);
          const nowIso = new Date().toISOString();
          latestCache = {
            requestedAt: nowIso,
            requestPlan,
            requestPayload: {
              power,
              num: this.config.api.defaults.num,
              status: this.config.api.defaults.status,
              order: this.config.api.defaults.order,
            },
            kingdomList: normalizedList,
          };
          latestPower = power;
          this.cacheStore.write(latestCache, { deferAverage: true });
        }

        this.cacheStore.updateAverage();
        this.refreshPowerOptions();
        this.renderRankChartPowerOptions();
        if (latestCache && Number.isFinite(latestPower)) {
          this.applyCacheResult(latestCache, latestPower, this.api.buildRequestPlan(latestPower));
        }
        this.setStatus(this.t("batchFetchDone", {
          from: formatPowerLabel(normalizedPowers[0]),
          to: formatPowerLabel(normalizedPowers[normalizedPowers.length - 1]),
          count: normalizedPowers.length,
        }));
        succeeded = true;
      } catch (error) {
        console.error(error);
        this.setStatus(this.buildFetchErrorMessage(error), true);
      } finally {
        this.setBusy(false);
        if (succeeded) this.finishSharedDataUpdate(normalizedPowers);
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
        const canvas = await this.renderElementToCanvas(container);
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
      wrapper.style.width = `${useSplitLayout
        ? this.config.imageExport.tableSplitWidth
        : this.config.imageExport.tableSingleWidth}px`;
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

    renderElementToCanvas(element) {
      return window.html2canvas(element, {
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
        scale: this.config.imageExport.captureScale,
      });
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
      const currentLanguage = this.i18n.currentLanguage();
      const locale = currentLanguage === "en" ? "en-US" : currentLanguage;
      return new Intl.DateTimeFormat(locale, {
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
      const kingdomSelection = options.preserveKingdomSelection ? this.dom.kingdomRangeListInput.value : "";
      const preservePageSize = options.preservePageSize === true;
      const shouldRerender = options.shouldRerender !== false;
      const currentPageSize = this.filter.normalizePageSize(
        this.dom.pageSizeSelect.value || this.state.filters.pageSize || this.filter.defaultPageSize()
      );

      this.state.filters = this.filter.createDefaultFilters();
      this.state.filters.pageSize = preservePageSize ? currentPageSize : this.filter.defaultPageSize();
      this.state.filters.kingdomRangeList = kingdomSelection;
      this.state.currentPage = 1;
      this.applyFiltersToUI();

      if (shouldRerender) this.rerender();
    }

    handlePowerChange() {
      const range = parsePowerRangeInput(this.dom.powerSelect.value);
      if (range?.length > 1) {
        this.updateSearchSelectionUrl({ powerSpec: this.dom.powerSelect.value.trim() });
        return;
      }
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
      this.state.busy = isBusy;
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
      this.dom.openRankChartButton.disabled = isBusy;
      this.dom.rankChartPowerList.disabled = isBusy;
      this.dom.refreshRankChartCacheButton.disabled = isBusy;
      this.dom.rankChartPowerRangeInput.disabled = isBusy;
      this.dom.rankChartKingdomInput.disabled = isBusy;
      this.updateRankChartActionButtonsDisabledState(isBusy);
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
      this.resetFilters({ preservePageSize: true, preserveKingdomSelection: true, shouldRerender: false });
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

  function parsePowerRangeInput(rawValue) {
    const text = String(rawValue || "")
      .trim()
      .replace(/[〜～–—]/g, "-");
    if (!text) return null;

    const compact = text.replace(/\s+/g, "").toUpperCase();
    const rangeMatch = compact.match(/^(\d+(?:\.\d+)?)([BM]?)-(\d+(?:\.\d+)?)([BM]?)$/);
    if (rangeMatch) {
      const suffix = rangeMatch[2] || rangeMatch[4] || "M";
      const start = parsePowerNumberWithSuffix(rangeMatch[1], rangeMatch[2] || suffix);
      const end = parsePowerNumberWithSuffix(rangeMatch[3], rangeMatch[4] || suffix);
      if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
      const min = Math.min(start, end);
      const max = Math.max(start, end);
      const powers = [];
      const first = Math.ceil(min / 100) * 100;
      for (let value = first; value <= max; value += 100) {
        powers.push(value);
      }
      return powers;
    }

    const tokens = text.toUpperCase().split(/[,\s/]+/).filter(Boolean);
    if (tokens.length === 0) return null;
    const powers = [];
    for (const token of tokens) {
      const parsed = parsePowerInput(token);
      if (!Number.isFinite(parsed)) return null;
      powers.push(parsed);
    }
    return powers;
  }

  function parseRankChartKingdomSelection(rawValue) {
    const tokens = String(rawValue || "").trim().split(/[,\s/]+/).filter(Boolean);
    const kingdomIds = [];
    const hidden = new Set();
    for (const token of tokens) {
      if (!/^!?\d+$/.test(token)) return { kingdomIds: [], hiddenKingdomIds: [] };
      const id = Number(token.replace(/^!/, ""));
      if (!Number.isFinite(id) || id <= 0) return { kingdomIds: [], hiddenKingdomIds: [] };
      if (!kingdomIds.includes(id)) kingdomIds.push(id);
      if (token.startsWith("!")) hidden.add(id);
    }
    return { kingdomIds, hiddenKingdomIds: kingdomIds.filter((id) => hidden.has(id)) };
  }

  function parseKingdomIdsInput(rawValue) {
    const tokens = String(rawValue || "")
      .trim()
      .split(/[,\s/]+/)
      .map((token) => token.trim())
      .filter(Boolean);
    const values = [];
    for (const token of tokens) {
      if (!/^\d+$/.test(token)) return [];
      const value = Number(token);
      if (!Number.isFinite(value) || value <= 0) return [];
      values.push(value);
    }
    return [...new Set(values)];
  }

  function parsePowerNumberWithSuffix(numberText, suffix) {
    const raw = String(numberText || "");
    const numberPart = Number(raw);
    const normalizedSuffix = String(suffix || "M").toUpperCase();
    if (!Number.isFinite(numberPart) || numberPart <= 0) return null;
    if (normalizedSuffix === "B") {
      if (raw.includes(".") && raw.split(".")[1].length > 1) return null;
      return Math.round(numberPart * 1000);
    }
    if (raw.includes(".")) return null;
    if (normalizedSuffix !== "M") return null;
    return Math.round(numberPart);
  }
})();
