# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

動画から自動的に画像付きマニュアル（Markdown形式）を生成するWebアプリケーション。
Gemini APIで動画を解析し、Cloudinaryで重要シーンのスクリーンショットを抽出して、ステップバイステップの手順書を自動生成する。

## アーキテクチャ

### フロントエンド
- **技術スタック**: React + TypeScript + Vite + Tailwind CSS
- **デプロイ**: Netlify
- **主要ライブラリ**: 
  - i18next (国際化)
  - react-hook-form + zod (フォーム管理・バリデーション)
  - react-markdown (Markdown表示)

### バックエンド
- **技術スタック**: Supabase Edge Functions (Deno環境)
- **メイン関数**: `process-video` - 動画処理のオーケストレーション
- **外部API**:
  - Gemini 2.5 Flash API (動画解析)
  - Cloudinary API (スクリーンショット抽出)

### ストレージ
- **Supabase Storage** (手動でバケット作成が必要):
  - `videos`: プライベートバケット（一時保存用）
  - `public-videos`: パブリックバケット（Cloudinary連携用）
  - `screenshots`: プライベートバケット
  
  設定手順は `docs/development/supabase-setup-manual.md` を参照

## 開発コマンド

### フロントエンド開発
```bash
cd frontend
npm run dev        # 開発サーバー起動 (http://localhost:5173)
npm run build      # プロダクションビルド
npm run lint       # ESLint実行
npm run preview    # プロダクションビルドのプレビュー
```

### バックエンド開発
```bash
# Edge Functionsのデプロイ
supabase functions deploy process-video  # 本番環境へデプロイ
```

**注意**: Supabaseの設定（バケット作成、ポリシー設定など）は手動で行います。
詳細は `docs/development/supabase-setup-manual.md` を参照してください。

## ディレクトリ構造

```
Create-Manual/
├── frontend/              # Reactアプリケーション
│   ├── src/
│   │   ├── components/   # UIコンポーネント
│   │   │   ├── common/   # 共通コンポーネント
│   │   │   ├── upload/   # アップロード関連
│   │   │   └── manual/   # マニュアル表示関連
│   │   ├── hooks/        # カスタムフック
│   │   ├── lib/          # ユーティリティ (API, Supabase, バリデーション)
│   │   ├── types/        # TypeScript型定義
│   │   ├── constants/    # 定数定義
│   │   └── locales/      # 多言語リソース (ja/, en/)
│   └── vite.config.ts    # パスエイリアス設定 (@, @components等)
│
├── supabase/             # バックエンド
│   └── functions/
│       ├── _shared/      # 共通ユーティリティ
│       │   ├── cors.ts   # CORS設定
│       │   ├── gemini.ts # Gemini API統合
│       │   └── cloudinary.ts # Cloudinary API統合
│       └── process-video/ # メインEdge Function
│
└── docs/                 # ドキュメント
    ├── requirements/     # 要件定義
    ├── architecture/     # アーキテクチャ設計
    └── development/      # 開発ガイド
```

## 重要な設計パターン

### 命名規則
- **コンポーネント**: PascalCase (`VideoUploader.tsx`)
- **フック**: `use`プレフィックス (`useVideoUpload.ts`)
- **定数**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)
- **Edge Functions**: kebab-case (`process-video`)

### TypeScript
- Strictモード有効
- Interfaceを優先使用
- Named exportsを推奨

### エラーハンドリング
- APIレスポンス形式: `{ success: boolean, data?: T, error?: string }`
- ユーザー向けメッセージ: 日本語
- 開発者向けログ: 英語

### 処理フロー
1. 動画アップロード (最大500MB、10分)
2. プライベート`videos`バケットに保存し、10分間有効な署名付きURL生成
3. 署名付きURLでGemini APIによる動画解析
4. 署名付きURLでCloudinaryによるスクリーンショット抽出
5. 抽出した画像をプライベート`screenshots`バケットに保存
6. Markdown形式でマニュアル生成（画像は`screenshots`バケットのURL）
7. ユーザーがダウンロード可能

## 環境変数

### フロントエンド (.env)
```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Edge Functions (Supabaseダッシュボードで手動設定)
```bash
GEMINI_API_KEY=your-gemini-api-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**設定方法**: Supabaseダッシュボード → Edge Functions → Settings → Secrets

**重要**: `SUPABASE_SERVICE_ROLE_KEY`はストレージへの管理者アクセスに必要です

## デバッグとテスト

### Edge Functionsのログ確認
Supabaseダッシュボード → Edge Functions → process-video → Logs タブで確認

### よくある問題
1. **署名付きURL期限切れ**: 動画の署名付きURLは10分間有効。処理時間を考慮
2. **Gemini APIエラー**: Resumable uploadプロトコルを使用。ファイルサイズとContent-Lengthヘッダーが必須
3. **ストレージ権限エラー**: `SUPABASE_SERVICE_ROLE_KEY`が正しく設定されているか確認
4. **CORS エラー**: `_shared/cors.ts`でCORSヘッダーを適切に設定

## セキュリティ考慮事項
- 動画の署名付きURLは10分で期限切れ（処理時間を考慮）
- 画像の署名付きURLは1時間で期限切れ
- APIキーは環境変数で管理
- 全てプライベートバケットを使用（`videos`, `screenshots`）
- Service Role Keyによるサーバーサイド専用アクセス