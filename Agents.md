# 基本方針

このプロジェクトは、**Git からダウンロードしたら `index.html` を開くだけで利用できる**ことを最優先とする。

## 構成ルール
1. 画面は `index.html` をエントリーポイントとする。
2. 自作 JavaScript はローカルファイルとして配置し、`index.html` から**相対パス**で参照する。
3. 外部ライブラリはローカル同梱せず、**CDN などの外部参照**で読み込む。
4. 特別なビルド、サーバー起動、インストール作業を前提にしない。

## 目的
- 誰でも環境差分なくすぐに使えること
- セットアップコストを最小化すること

## ドキュメント運用
- 現在のプロジェクト構成・画面仕様・挙動は `Specs.md` を正本とする。
- 設計変更（UI構成、テーマ仕様、データ取得方式、キャッシュ方式、フィルタ条件、依存ライブラリ）を行った場合は、実装変更と同じコミットで `Specs.md` を更新する。

## サーバー更新運用
- 「サーバーにアップロードして」「サーバー更新して」と依頼された場合は、AWS Lambda 公開環境の更新として扱う。
- 実施内容は原則として以下とする。
  1. `bash lambda-work/build-lambda-package.sh` でデプロイパッケージを作成する。
  2. `sam deploy --template-file lambda-work/template.yaml --stack-name getting-migration-tool --region ap-northeast-1 --resolve-s3 --capabilities CAPABILITY_IAM --no-confirm-changeset --no-fail-on-empty-changeset` を実行する。
  3. 必要に応じて Function URL へ疎通確認を行う。
- 先に `aws sts get-caller-identity` 等で AWS 認証状態を確認し、`aws login` の期限切れ・未認証で失敗した場合は、最初にユーザーへ再認証を依頼してから作業を続ける。
