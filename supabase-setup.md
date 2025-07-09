# Supabase セットアップガイド

このドキュメントでは、Create-Manualアプリケーションに必要なSupabaseの設定手順を説明します。

## 必要な設定

### 1. ストレージバケットの作成

#### videosバケット（パブリック）
```sql
-- 動画用バケット（パブリック - Cloudinary連携のため）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  true,
  524288000, -- 500MB
  ARRAY['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']
);
```

#### screenshotsバケット（プライベート）
```sql
-- スクリーンショット用バケット（プライベート）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'screenshots',
  'screenshots',
  false,
  10485760, -- 10MB
  ARRAY['image/png', 'image/jpeg', 'image/webp']
);
```

### 2. Row Level Security（RLS）の有効化

```sql
-- Row Level Securityを有効化
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
```

### 3. ストレージポリシーの設定

#### videosバケット用ポリシー
```sql
-- 動画アップロードを許可
CREATE POLICY "Allow video uploads" ON storage.objects
FOR INSERT 
WITH CHECK (bucket_id = 'videos');

-- 動画の読み取りを許可（パブリックバケット）
CREATE POLICY "Allow video reads" ON storage.objects
FOR SELECT 
USING (bucket_id = 'videos');

-- 動画の削除を許可（クリーンアップ用）
CREATE POLICY "Allow video deletes" ON storage.objects
FOR DELETE 
USING (bucket_id = 'videos');
```

#### screenshotsバケット用ポリシー
```sql
-- スクリーンショットアップロードを許可
CREATE POLICY "Allow screenshot uploads" ON storage.objects
FOR INSERT 
WITH CHECK (bucket_id = 'screenshots');

-- スクリーンショットの読み取りを許可（署名付きURL経由）
CREATE POLICY "Allow screenshot reads" ON storage.objects
FOR SELECT 
USING (bucket_id = 'screenshots');

-- スクリーンショットの削除を許可（クリーンアップ用）
CREATE POLICY "Allow screenshot deletes" ON storage.objects
FOR DELETE 
USING (bucket_id = 'screenshots');
```

### 4. 自動クリーンアップ機能の設定

#### pg_cronエクステンションの有効化
```sql
-- pg_cronエクステンションを有効化
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

#### クリーンアップ関数の作成
```sql
-- 古いファイルを削除する関数
CREATE OR REPLACE FUNCTION cleanup_old_files()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cutoff_time timestamp;
  deleted_count integer;
BEGIN
  -- 15分前のタイムスタンプを計算
  cutoff_time := now() - interval '15 minutes';
  
  -- 古い動画ファイルを削除
  DELETE FROM storage.objects
  WHERE bucket_id = 'videos' 
    AND created_at < cutoff_time;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % old video files', deleted_count;
  
  -- 古いスクリーンショットを削除
  DELETE FROM storage.objects
  WHERE bucket_id = 'screenshots' 
    AND created_at < cutoff_time;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % old screenshot files', deleted_count;
END;
$$;
```

#### 定期実行スケジュールの設定
```sql
-- 15分ごとにクリーンアップ関数を実行
SELECT cron.schedule(
  'cleanup-old-files-job',
  '*/15 * * * *', -- 15分ごと
  'SELECT cleanup_old_files();'
);
```

### 5. 必要な権限の設定

```sql
-- 必要な権限をpostgresロールに付与
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA storage TO postgres;
```

## 環境変数の設定

### フロントエンド環境変数
```bash
# .env ファイルに設定
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Edge Functions環境変数
Supabaseダッシュボード → Edge Functions → Settings → Secrets で以下を設定：

```bash
# Supabase設定
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Gemini API設定
GEMINI_API_KEY=your-gemini-api-key

# Cloudinary設定
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

## 設定の確認

### 1. バケットが正しく作成されているか確認
```sql
SELECT name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id IN ('videos', 'screenshots');
```

### 2. ポリシーが正しく設定されているか確認
```sql
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
```

### 3. クリーンアップジョブが設定されているか確認
```sql
SELECT jobname, schedule, command 
FROM cron.job 
WHERE jobname = 'cleanup-old-files-job';
```

## トラブルシューティング

### よくある問題と解決方法

1. **ファイルアップロードエラー**
   - バケットの`file_size_limit`と`allowed_mime_types`を確認
   - RLSポリシーが正しく設定されているか確認

2. **クリーンアップが動作しない**
   - `pg_cron`エクステンションが有効になっているか確認
   - クリーンアップ関数が正しく作成されているか確認

3. **Edge Functionsからのアクセスエラー**
   - `SUPABASE_SERVICE_ROLE_KEY`が正しく設定されているか確認
   - Edge Functionsの環境変数が正しく設定されているか確認

## セキュリティ考慮事項

- **videosバケット**: Cloudinary連携のためパブリック設定が必要
- **screenshotsバケット**: プライベート設定で署名付きURL使用
- **自動削除**: 15分間隔でファイルを自動削除してセキュリティを保持
- **RLS**: Row Level Securityを有効化して不正アクセスを防止

## 注意事項

1. **本番環境での使用前に**、必ずテスト環境で設定を検証してください
2. **Service Role Key**は慎重に管理し、Edge Functions環境変数でのみ使用してください
3. **クリーンアップ機能**は本番環境で重要な機能です。必ず動作確認を行ってください