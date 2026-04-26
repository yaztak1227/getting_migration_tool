# Lords Mobile 移民の巻物検索 API 仕様メモ

## 概要

ロードモバイル公式「移民の巻物検索」で利用されている Ajax API。

自分のパワー・希望巻物数・王国状態を条件として、移民可能な王国一覧を返す。

---

# 公式ページ

```text
https://lordsmobile.igg.com/project/game_tool/index.php?action=get_migration_scroll&lang=ja
```

---

# API Endpoint

```text
https://lordsmobile.igg.com/project/game_tool/ajax.php?action=get_migration_scroll&lang=ja
```

---

# HTTP仕様

## Method

```http
POST
```

## Content-Type

```http
multipart/form-data
```

---

# Query Parameters

| Name | Required | Value | Description |
|---|---|---|---|
| action | yes | get_migration_scroll | API種別 |
| lang | optional | ja | 表示言語 |

---

# Form Parameters

| Name | Required | Example | Description |
|---|---|---|---|
| power | yes | 2400 | 自分のパワー（100万単位） |
| num | yes | 90 | 希望する移民の巻物数（この枚数以下条件の可能性高） |
| status | yes | 0 | 王国状態フィルタ |
| order | yes | 1 | 並び順 |

---

# power

```text
100万(M)単位で送信
```

---

# Payload形式

```http
power=2400
num=90
status=0
order=1
```

multipart/form-data で送信。

---

# 王国状態フィルタ (status)

| 値 | 状態 |
|---|---|
| 0 | 制限なし |
| 1 | 閑散 |
| 2 | 正常 |
| 3 | 混雑 |
| 4 | 過密 |

---

# order (並び順)

確認済み入力:

```text
order=1
```

追加値:

```text
order=2
order=3
```

など存在可能性あり（要検証）。

---

# レスポンス形式

JSONレスポンス。

## エラー例

```json
{
  "code":1001,
  "data":[],
  "msg":"パワーの最小値は100万となります"
}
```

## 正常時（推定）

```json
{
  "code":0,
  "data":[
    {
      "kingdom":"...",
      "scroll":"..."
    }
  ],
  "msg":"..."
}
```

---

# 既知の制約

## 最小入力制約

- power 必須
- 最低100万以上

## 件数上限

条件を広げると

```text
約1339件で打ち止め
```

になる場合あり。

サーバー側返却上限の可能性。

---

# 利用可能フィルタ

## 巻物数

```text
num = 1〜90
```

## 王国状態

```text
status = 0〜4
```

## 並び順

```text
order = 1...
```

---

# 件数上限回避戦略

## num分割

```text
num=1〜90
```

で分割取得。

## status分割

```text
statusごと取得
```

## order違い取得

```text
別ソートで union
```

---

# ページング候補（未確認）

ブラウザ payload では未確認。

候補:

```text
page
offset
limit
start
rows
size
```

対応有無不明。

---

# 実装注意

- multipart/form-data 送信
- power は100万単位
- num は「以下条件」の可能性高い
- 返却件数上限あり
- num / status / order 分割で補完可能

---

# 追加観測メモ（2026-04-26 JST）

- 検証条件: `power=2400`, `num=90`, `status=0`
- `order=1` と `order=2` をそれぞれ取得すると、どちらも `1939件` を返却
- 両者を `kingdom_id` キーでマージしてもユニーク件数は `1939件`（増加なし）
- 期待最大値 `1982` との差分 `43件` は、API未取得漏れではなく、ゲーム内の移民制限ルールにより「当日移民可能な王国範囲」が制約されている可能性が高い
- したがって、このAPIは「存在する全王国」ではなく「条件時点で移民判定対象となる王国集合」を返していると考えられる
- 上限値は日次で変動しうる（移民制限緩和により将来的に増える可能性）
