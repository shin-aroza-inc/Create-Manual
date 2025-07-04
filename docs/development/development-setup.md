# 開発環境セットアップ手順

## 前提条件

### 必要なツール
- **Node.js**: v20 LTS
- **pnpm**: v8以上
- **Git**: v2.30以上
- **Supabase CLI**: 最新版
- **エディタ**: VS Code推奨

### 推奨VS Code拡張機能
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)
- GitLens
- Error Lens

## セットアップ手順

### 1. リポジトリのクローン
```bash
git clone https://github.com/your-org/create-manual.git
cd create-manual
```

### 2. Supabaseプロジェクトのセットアップ

#### 2.1 Supabaseプロジェクト作成
1. [Supabase Dashboard](https://app.supabase.com)にアクセス
2. 新規プロジェクトを作成
3. プロジェクトURL、anon key、service keyを取得

#### 2.2 Storageバケット作成
```sql
-- Supabase SQLエディタで実行
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', false);

INSERT INTO storage.buckets (id, name, public)
VALUES ('screenshots', 'screenshots', false);
```

#### 2.3 Storage ポリシー設定
```sql
-- 動画アップロード用ポリシー
CREATE POLICY "Allow video uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'videos');

-- スクリーンショット用ポリシー
CREATE POLICY "Allow screenshot uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'screenshots');

-- 読み取り用ポリシー
CREATE POLICY "Allow public read" ON storage.objects
FOR SELECT USING (bucket_id IN ('videos', 'screenshots'));
```

### 3. 外部APIの設定

#### 3.1 Gemini API
1. [Google AI Studio](https://makersuite.google.com/app/apikey)にアクセス
2. APIキーを生成
3. 使用制限を設定（推奨）

#### 3.2 Cloudinary
1. [Cloudinary Dashboard](https://cloudinary.com/console)にアクセス
2. アカウント作成
3. Cloud Name、API Key、API Secretを取得

### 4. フロントエンド環境構築

#### 4.1 依存関係インストール
```bash
cd frontend
pnpm install
```

#### 4.2 環境変数設定
```bash
# .env.exampleをコピー
cp .env.example .env

# .envを編集
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### 4.3 開発サーバー起動
```bash
pnpm dev
# http://localhost:5173 でアクセス可能
```

### 5. Supabase Edge Functions設定

#### 5.1 Supabase CLIログイン
```bash
supabase login
```

#### 5.2 プロジェクトリンク
```bash
cd ../supabase
supabase link --project-ref your-project-ref
```

#### 5.3 環境変数設定
```bash
# Supabaseダッシュボードで設定
# Edge Functions > Settings > Secrets

GEMINI_API_KEY=your-gemini-key
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
```

#### 5.4 Edge Functionsデプロイ
```bash
# 個別デプロイ
supabase functions deploy process-video
supabase functions deploy generate-manual
supabase functions deploy extract-screenshots

# 一括デプロイ
supabase functions deploy
```

### 6. ローカル開発

#### 6.1 Supabaseローカル環境起動
```bash
# Dockerが必要
supabase start

# ローカルURLが表示される
# API URL: http://localhost:54321
# DB URL: postgresql://postgres:postgres@localhost:54322/postgres
```

#### 6.2 Edge Functionsローカル実行
```bash
supabase functions serve process-video --env-file ./supabase/.env.local
```

## 開発用スクリプト

### package.jsonスクリプト
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

### 便利なコマンド
```bash
# コード整形
pnpm format

# 型チェック
pnpm type-check

# リント実行
pnpm lint

# ビルド
pnpm build
```

## トラブルシューティング

### よくある問題

#### 1. CORS エラー
```typescript
// Edge Functions内でCORSヘッダーを設定
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

#### 2. 環境変数が読み込まれない
```bash
# Viteの場合、VITE_プレフィックスが必要
VITE_SUPABASE_URL=xxx  # ○
SUPABASE_URL=xxx       # ✗
```

#### 3. Edge Functions タイムアウト
```typescript
// デフォルト30秒を延長
export const config = {
  runtime: 'edge',
  maxDuration: 300, // 5分
}
```

#### 4. pnpmインストールエラー
```bash
# キャッシュクリア
pnpm store prune

# node_modules削除して再インストール
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## デバッグ設定

### VS Code launch.json
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome against localhost",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/frontend/src"
    }
  ]
}
```

### Chrome DevTools
1. React Developer Tools インストール
2. Network タブで API 通信確認
3. Application タブで LocalStorage 確認

## 開発フロー

### 1. 機能開発の流れ
```bash
# 1. 最新のdevelopを取得
git checkout develop
git pull origin develop

# 2. featureブランチ作成
git checkout -b feature/new-feature

# 3. 開発
pnpm dev

# 4. コミット前チェック
pnpm lint
pnpm type-check
pnpm format

# 5. コミット
git add .
git commit -m "feat: 新機能を追加"

# 6. プッシュ
git push origin feature/new-feature
```

### 2. Edge Functions開発
```bash
# 1. ローカルでテスト
supabase functions serve function-name --env-file .env.local

# 2. curlでテスト
curl -i --location --request POST 'http://localhost:54321/functions/v1/function-name' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"test": "data"}'

# 3. デプロイ
supabase functions deploy function-name
```

## 本番環境へのデプロイ準備

### Netlify設定
1. GitHub連携
2. ビルド設定
   - Build command: `cd frontend && pnpm build`
   - Publish directory: `frontend/dist`
3. 環境変数設定

### デプロイチェックリスト
- [ ] 環境変数が本番用に設定されている
- [ ] ビルドエラーがない
- [ ] APIエンドポイントが本番URLを指している
- [ ] Supabase Edge Functionsがデプロイされている
- [ ] Storageポリシーが適切に設定されている