# プロジェクト構成

## フォルダ構造

```
create-manual/
├── docs/                       # ドキュメント
│   ├── requirements.md         # 要件定義
│   ├── tech-stack.md          # 技術スタック
│   ├── coding-standards.md    # コーディング規約
│   └── ...
│
├── frontend/                   # フロントエンドアプリケーション
│   ├── public/                # 静的ファイル
│   │   └── favicon.ico
│   │
│   ├── src/
│   │   ├── components/        # UIコンポーネント
│   │   │   ├── common/        # 共通コンポーネント
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Loading.tsx
│   │   │   │   └── ErrorMessage.tsx
│   │   │   │
│   │   │   ├── upload/        # アップロード関連
│   │   │   │   ├── VideoUploader.tsx
│   │   │   │   ├── UploadProgress.tsx
│   │   │   │   └── FileValidator.tsx
│   │   │   │
│   │   │   └── manual/        # マニュアル関連
│   │   │       ├── ManualViewer.tsx
│   │   │       ├── ManualDownloader.tsx
│   │   │       └── MarkdownRenderer.tsx
│   │   │
│   │   ├── hooks/             # カスタムフック
│   │   │   ├── useVideoUpload.ts
│   │   │   ├── useManualGeneration.ts
│   │   │   └── useSupabase.ts
│   │   │
│   │   ├── lib/               # ユーティリティ・ライブラリ
│   │   │   ├── supabase.ts    # Supabaseクライアント
│   │   │   ├── api.ts         # API通信
│   │   │   └── validators.ts  # バリデーション
│   │   │
│   │   ├── types/             # 型定義
│   │   │   ├── manual.types.ts
│   │   │   ├── video.types.ts
│   │   │   └── api.types.ts
│   │   │
│   │   ├── constants/         # 定数
│   │   │   ├── API_ENDPOINTS.ts
│   │   │   ├── FILE_LIMITS.ts
│   │   │   └── MESSAGES.ts
│   │   │
│   │   ├── locales/           # 多言語対応
│   │   │   ├── ja/
│   │   │   │   └── translation.json
│   │   │   └── en/
│   │   │       └── translation.json
│   │   │
│   │   ├── styles/            # グローバルスタイル
│   │   │   └── globals.css
│   │   │
│   │   ├── App.tsx            # メインアプリケーション
│   │   ├── main.tsx           # エントリーポイント
│   │   └── vite-env.d.ts      # Vite型定義
│   │
│   ├── .env.example           # 環境変数サンプル
│   ├── .eslintrc.json         # ESLint設定
│   ├── .prettierrc            # Prettier設定
│   ├── index.html             # HTMLテンプレート
│   ├── package.json           # 依存関係
│   ├── tailwind.config.js     # Tailwind設定
│   ├── tsconfig.json          # TypeScript設定
│   └── vite.config.ts         # Vite設定
│
├── supabase/                  # Supabase設定
│   ├── functions/             # Edge Functions
│   │   ├── process-video/     # 動画処理
│   │   │   └── index.ts
│   │   ├── generate-manual/   # マニュアル生成
│   │   │   └── index.ts
│   │   ├── extract-screenshots/ # スクリーンショット抽出
│   │   │   └── index.ts
│   │   └── _shared/           # 共通コード
│   │       ├── cors.ts
│   │       └── types.ts
│   │
│   └── config.toml            # Supabase設定
│
├── .gitignore                 # Git除外設定
├── README.md                  # プロジェクト説明
└── package.json               # ルートpackage.json（必要に応じて）
```

## ファイル命名規則

### コンポーネント
- **ファイル名**: PascalCase + `.tsx`
- **例**: `VideoUploader.tsx`, `ManualViewer.tsx`

### フック
- **ファイル名**: `use` + PascalCase + `.ts`
- **例**: `useVideoUpload.ts`, `useManualGeneration.ts`

### ユーティリティ
- **ファイル名**: camelCase + `.ts`
- **例**: `formatDate.ts`, `validateFile.ts`

### 定数
- **ファイル名**: UPPER_SNAKE_CASE + `.ts`
- **例**: `API_ENDPOINTS.ts`, `FILE_LIMITS.ts`

### 型定義
- **ファイル名**: PascalCase + `.types.ts`
- **例**: `Manual.types.ts`, `Video.types.ts`

## インポート順序

```typescript
// 1. React関連
import React, { useState, useEffect } from 'react'

// 2. 外部ライブラリ
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'

// 3. 内部コンポーネント
import { Button } from '@/components/common/Button'
import { VideoUploader } from '@/components/upload/VideoUploader'

// 4. フック
import { useVideoUpload } from '@/hooks/useVideoUpload'

// 5. ユーティリティ・型
import { validateVideo } from '@/lib/validators'
import type { VideoFile } from '@/types/video.types'

// 6. 定数
import { FILE_LIMITS } from '@/constants/FILE_LIMITS'

// 7. スタイル（必要な場合）
import styles from './Component.module.css'
```

## パスエイリアス設定

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@lib/*": ["./src/lib/*"],
      "@types/*": ["./src/types/*"],
      "@constants/*": ["./src/constants/*"]
    }
  }
}
```

## 環境変数

### フロントエンド (.env)
```env
# Supabase
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# アプリケーション設定
VITE_APP_NAME=マニュアル自動生成
VITE_MAX_FILE_SIZE=524288000  # 500MB
VITE_SUPPORTED_FORMATS=mp4,mov,avi,webm
```

### Supabase Edge Functions
```typescript
// Deno.env.get() で取得
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
const CLOUDINARY_API_KEY = Deno.env.get('CLOUDINARY_API_KEY')
const CLOUDINARY_API_SECRET = Deno.env.get('CLOUDINARY_API_SECRET')
const CLOUDINARY_CLOUD_NAME = Deno.env.get('CLOUDINARY_CLOUD_NAME')
```

## ビルド成果物

```
frontend/dist/              # Netlifyにデプロイ
├── assets/                # JS/CSSバンドル
├── index.html             # エントリーHTML
└── _redirects             # Netlifyリダイレクト設定
```

## 除外ファイル (.gitignore)

```gitignore
# 依存関係
node_modules/
.pnpm-store/

# 環境変数
.env
.env.local
.env.*.local

# ビルド成果物
dist/
build/
.next/

# エディタ
.vscode/
.idea/
*.swp
*.swo
.DS_Store

# ログ
*.log
npm-debug.log*
pnpm-debug.log*

# テスト
coverage/
.nyc_output/

# Supabase
supabase/.temp/
supabase/.branches/
```