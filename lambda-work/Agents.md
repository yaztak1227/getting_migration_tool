# Lambda 運用メモ

## サーバー更新運用
- 「サーバーにアップロードして」「サーバー更新して」と依頼された場合は、AWS Lambda 公開環境の更新として扱う。
- 実施内容は原則として以下とする。
  1. `bash lambda-work/build-lambda-package.sh` でデプロイパッケージを作成する。
  2. `sam deploy --template-file lambda-work/template.yaml --stack-name getting-migration-tool --region ap-northeast-1 --resolve-s3 --capabilities CAPABILITY_IAM --no-confirm-changeset --no-fail-on-empty-changeset` を実行する。
  3. 必要に応じて Function URL へ疎通確認を行う。
- 先に `aws sts get-caller-identity` 等で AWS 認証状態を確認し、`aws login` の期限切れ・未認証で失敗した場合は、最初にユーザーへ再認証を依頼してから作業を続ける。
