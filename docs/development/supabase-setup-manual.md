# Supabase 手動設定手順書

このドキュメントでは、アプリケーションを動作させるために必要なSupabaseの手動設定手順を説明します。

## 🚀 事前準備

1. [Supabase](https://app.supabase.com) アカウントの作成
2. [Supabase CLI](https://supabase.com/docs/guides/cli) のインストール
3. Gemini API キーの取得
4. Cloudinary API キーの取得

## 📋 設定手順

### 1. Supabaseプロジェクト作成

1. Supabaseダッシュボードにアクセス
2. 「New Project」をクリック
3. プロジェクト名を設定（例: `manual-generator`）
4. Database Passwordを設定
5. Regionを選択（日本の場合: `Northeast Asia (Tokyo)`）
6. 「Create new project」をクリック

### 2. プロジェクト情報の取得

プロジェクト作成後、以下の情報を取得してメモしてください：

- **Project URL**: `https://xxxxx.supabase.co`
- **Anon public**: `eyJhbGciOiJ...` (フロントエンド用)
- **Service role**: `eyJhbGciOiJ...` (Edge Functions用)

### 3. Storage バケットの作成

#### 3.1 動画用バケット（プライベート）
```sql
-- SQLエディタで実行
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', false);
```

#### 3.2 動画用バケット（パブリック）- Cloudinary用
```sql
-- SQLエディタで実行
INSERT INTO storage.buckets (id, name, public)
VALUES ('public-videos', 'public-videos', true);
```

#### 3.3 スクリーンショット用バケット
```sql
-- SQLエディタで実行
INSERT INTO storage.buckets (id, name, public)
VALUES ('screenshots', 'screenshots', false);
```

### 4. Storage ポリシーの設定

#### 4.1 RLS有効化とポリシー作成
```sql
-- まずRow Level Securityを有効化
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 動画用ポリシー（プライベート）
CREATE POLICY "Allow video uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Allow video access" ON storage.objects
FOR SELECT USING (bucket_id = 'videos');

CREATE POLICY "Allow video deletion" ON storage.objects
FOR DELETE USING (bucket_id = 'videos');

-- 動画用ポリシー（パブリック）
CREATE POLICY "Allow public video uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'public-videos');

CREATE POLICY "Allow public video access" ON storage.objects
FOR SELECT USING (bucket_id = 'public-videos');

CREATE POLICY "Allow public video deletion" ON storage.objects
FOR DELETE USING (bucket_id = 'public-videos');

-- スクリーンショット用ポリシー
CREATE POLICY "Allow screenshot uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'screenshots');

CREATE POLICY "Allow screenshot access" ON storage.objects
FOR SELECT USING (bucket_id = 'screenshots');

CREATE POLICY "Allow screenshot deletion" ON storage.objects
FOR DELETE USING (bucket_id = 'screenshots');
```

#### 4.2 ポリシーのリセット（エラー時）
```sql
-- 既存ポリシーをすべて削除してからやり直す場合
DROP POLICY IF EXISTS "Allow video uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow video access" ON storage.objects;
DROP POLICY IF EXISTS "Allow video deletion" ON storage.objects;
DROP POLICY IF EXISTS "Allow public video uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public video access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public video deletion" ON storage.objects;
DROP POLICY IF EXISTS "Allow screenshot uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow screenshot access" ON storage.objects;
DROP POLICY IF EXISTS "Allow screenshot deletion" ON storage.objects;

-- 上記のCREATE POLICY文を再実行
```

### 5. 自動削除機能の設定（オプション）

#### 5.1 自動削除用SQL関数作成
```sql
-- 1時間以上古いファイルを削除する関数
CREATE OR REPLACE FUNCTION delete_old_files()
RETURNS void AS $$
BEGIN
  DELETE FROM storage.objects 
  WHERE bucket_id IN ('videos', 'public-videos', 'screenshots') 
    AND created_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;
```

#### 5.2 定期実行の設定
```sql
-- pg_cronエクステンションを有効化（必要な場合）
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 1時間ごとに削除実行（管理者権限が必要）
-- SELECT cron.schedule('delete-old-files', '0 * * * *', 'SELECT delete_old_files();');
```

### 6. Edge Functions環境変数の設定

Supabaseダッシュボードで以下の環境変数を設定：

1. 「Edge Functions」→「Settings」→「Secrets」に移動
2. 以下の変数を追加：

```bash
# Gemini API
GEMINI_API_KEY=your-gemini-api-key

# Cloudinary API
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Supabase（自動設定されるが確認）
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 7. Edge Functions デプロイ

```bash
# プロジェクトルートで実行
cd supabase

# Supabase CLIでログイン
supabase login

# プロジェクトとリンク
supabase link --project-ref your-project-ref

# Edge Functionsをデプロイ
supabase functions deploy process-video
```

### 8. フロントエンド環境変数の設定

#### 8.1 ローカル開発用
```bash
# frontend/.env ファイルを作成
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### 8.2 Netlifyデプロイ用
Netlifyダッシュボードで環境変数を設定：
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 🔧 動作確認

### 1. Edge Functions 動作確認
```bash
# curlで動作確認
curl -i --location --request POST 'https://xxxxx.supabase.co/functions/v1/process-video' \\
  --header 'Authorization: Bearer YOUR_ANON_KEY' \\
  --header 'Content-Type: application/json' \\
  --data '{
    \"videoUrl\": \"test-url\",
    \"language\": \"ja\",
    \"detailLevel\": \"simple\"
  }'
```

### 2. Storage 動作確認
```bash
# Storageバケットの確認
curl -X GET 'https://xxxxx.supabase.co/storage/v1/bucket' \\
  -H 'Authorization: Bearer YOUR_ANON_KEY'
```

## 🚨 トラブルシューティング

### よくある問題

#### 1. Edge Functions タイムアウト
- デフォルト30秒を300秒に延長済み
- 大きなファイルの場合は更なる調整が必要

#### 2. CORS エラー
- `corsHeaders`が正しく設定されていることを確認
- Netlifyのドメインが許可されていることを確認

#### 3. Storage権限エラー
- ポリシーが正しく設定されているか確認
- anon キーで適切な権限があるか確認

#### 4. API キーエラー
- 環境変数が正しく設定されているか確認
- Gemini/Cloudinary のAPI制限を確認

### ログの確認方法

#### Edge Functions ログ
```bash
# Supabase CLIでログ確認
supabase functions logs process-video
```

#### ダッシュボードでのログ確認
1. Supabaseダッシュボード
2. 「Edge Functions」→「process-video」
3. 「Logs」タブでリアルタイムログを確認

## 📞 サポート

設定で問題が発生した場合：

1. まずトラブルシューティングを確認
2. Supabaseダッシュボードでログを確認
3. GitHub Issuesで報告

## 🔄 更新・メンテナンス

### Edge Functions の更新
```bash
# 最新のFunctionsをデプロイ
supabase functions deploy process-video --debug
```

### 環境変数の更新
1. Supabaseダッシュボードで変数を更新
2. Edge Functionsを再デプロイ