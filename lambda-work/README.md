# AWS Lambda work area

このフォルダは AWS Lambda デプロイ用の作業領域です。ルートの `index.html` 直開き運用は変えず、Lambda 用ファイルだけをここで管理します。

## 含まれるもの
- `lambda-handler.js`: 静的ファイル配信と `/api/migration` プロキシを兼ねる Lambda ハンドラ
- `template.yaml`: AWS SAM テンプレート
- `build-lambda-package.sh`: デプロイ対象ファイルを `build/package/` にまとめるスクリプト

## 前提
- AWS CLI と SAM CLI が使えること
- AWS 認証が通っていること
- 現在のデプロイ先リージョンは `ap-northeast-1`
- 現在のスタック名は `getting-migration-tool`
- Lambda ランタイムは `nodejs24.x` を使うこと

## 初回デプロイ
1. パッケージを生成する

```bash
bash lambda-work/build-lambda-package.sh
```

2. SAM でデプロイする

```bash
sam deploy \
  --template-file lambda-work/template.yaml \
  --stack-name getting-migration-tool \
  --region ap-northeast-1 \
  --resolve-s3 \
  --capabilities CAPABILITY_IAM \
  --no-confirm-changeset \
  --no-fail-on-empty-changeset
```

## 更新デプロイ
フロントや `lambda-handler.js` を変えたら、同じ手順で再デプロイします。

```bash
bash lambda-work/build-lambda-package.sh

sam deploy \
  --template-file lambda-work/template.yaml \
  --stack-name getting-migration-tool \
  --region ap-northeast-1 \
  --resolve-s3 \
  --capabilities CAPABILITY_IAM \
  --no-confirm-changeset \
  --no-fail-on-empty-changeset
```

## 公開 URL の確認
CloudFormation 出力から現在の Function URL を確認します。

```bash
aws cloudformation describe-stacks \
  --stack-name getting-migration-tool \
  --region ap-northeast-1 \
  --query 'Stacks[0].Outputs' \
  --output table
```

現時点の公開 URL:
- `https://hkudukbwxhbxpqsrlnzxngh6va0fcmkq.lambda-url.ap-northeast-1.on.aws/`

## 疎通確認
トップページ確認:

```bash
curl -i https://hkudukbwxhbxpqsrlnzxngh6va0fcmkq.lambda-url.ap-northeast-1.on.aws/ | sed -n '1,20p'
```

API 確認:

```bash
curl -i \
  -X POST \
  https://hkudukbwxhbxpqsrlnzxngh6va0fcmkq.lambda-url.ap-northeast-1.on.aws/api/migration \
  -H 'content-type: application/json' \
  --data '{"power":100,"num":1,"status":0,"order":1}' \
  | sed -n '1,20p'
```

## 削除
不要になったらスタックごと削除します。

```bash
aws cloudformation delete-stack \
  --stack-name getting-migration-tool \
  --region ap-northeast-1
```

## メモ
- 生成物は `lambda-work/build/` に出力され、Git には含めません。
- Lambda Function URL を使う前提です。
- 画面側の API パスは相対 `/api/migration` のままなので、同一 Lambda から静的配信と API をまとめて返せます。
- `sam deploy` では IAM ロール作成のため `--capabilities CAPABILITY_IAM` が必要です。
