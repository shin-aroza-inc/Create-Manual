# コーディング規約

## 1. 全般的なルール

### 1.1 言語設定
- **TypeScript**: strictモードを有効化
- **コメント**: 日本語で記述（コード内の変数名・関数名は英語）
- **エラーメッセージ**: ユーザー向けは日本語、開発者向けログは英語

### 1.2 フォーマッティング
- **インデント**: スペース2文字
- **行末**: セミコロンなし
- **クォート**: シングルクォート優先
- **改行コード**: LF（Unix形式）

## 2. ファイル命名規則

### 2.1 基本ルール
- **コンポーネント**: PascalCase（例: `VideoUploader.tsx`）
- **ユーティリティ**: camelCase（例: `formatDate.ts`）
- **定数ファイル**: UPPER_SNAKE_CASE（例: `API_ENDPOINTS.ts`）
- **型定義**: PascalCase + `.types.ts`（例: `Manual.types.ts`）

### 2.2 Supabase Edge Functions
- kebab-case（例: `process-video`、`generate-manual`）

## 3. TypeScript規約

### 3.1 型定義
```typescript
// ✅ Good - インターフェースを優先
interface User {
  id: string
  name: string
}

// ❌ Bad - typeは交差型・合併型のみで使用
type User = {
  id: string
  name: string
}
```

### 3.2 エクスポート
```typescript
// ✅ Good - 名前付きエクスポート
export const processVideo = () => {}

// ❌ Bad - デフォルトエクスポートは避ける
export default processVideo
```

### 3.3 非同期処理
```typescript
// ✅ Good - async/awaitを使用
const fetchData = async () => {
  try {
    const data = await api.get()
    return data
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

// ❌ Bad - Promiseチェーンは避ける
const fetchData = () => {
  return api.get().then().catch()
}
```

## 4. React規約

### 4.1 コンポーネント定義
```tsx
// ✅ Good - 関数コンポーネント + 型定義
interface ButtonProps {
  label: string
  onClick: () => void
}

export const Button: React.FC<ButtonProps> = ({ label, onClick }) => {
  return <button onClick={onClick}>{label}</button>
}
```

### 4.2 状態管理
```tsx
// ✅ Good - 明確な命名
const [isLoading, setIsLoading] = useState(false)
const [uploadProgress, setUploadProgress] = useState(0)

// ❌ Bad - 曖昧な命名
const [flag, setFlag] = useState(false)
const [value, setValue] = useState(0)
```

### 4.3 イベントハンドラ
```tsx
// ✅ Good - handle + 動作
const handleSubmit = () => {}
const handleVideoUpload = () => {}

// ❌ Bad - 不明確な命名
const submit = () => {}
const onUpload = () => {}
```

## 5. CSS規約（Tailwind CSS）

### 5.1 クラス順序
1. レイアウト（flex, grid）
2. 配置（justify, items）
3. サイズ（w, h）
4. 間隔（p, m）
5. 背景（bg）
6. ボーダー（border, rounded）
7. テキスト（text, font）
8. その他（shadow, transition）

```tsx
// ✅ Good
<div className="flex items-center justify-between w-full p-4 bg-white rounded-lg shadow-md">
```

### 5.2 カスタムカラー
```tsx
// アクセントカラー（緑と水色の中間）をtailwind.config.jsで定義
<button className="bg-primary hover:bg-primary-dark">
```

## 6. API通信規約

### 6.1 エラーハンドリング
```typescript
// ✅ Good - 統一されたレスポンス形式
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

const apiCall = async <T>(): Promise<ApiResponse<T>> => {
  try {
    const data = await fetch()
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

### 6.2 環境変数
```typescript
// ✅ Good - VITE_プレフィックス使用
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
```

## 7. Supabase Edge Functions規約

### 7.1 関数構造
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  // CORSヘッダー設定
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // OPTIONSリクエスト処理
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers })
  }

  try {
    // メイン処理
    const result = await processRequest(req)
    return new Response(JSON.stringify(result), {
      headers: { ...headers, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...headers, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
```

## 8. コミットメッセージ規約

### 8.1 プレフィックス
- `feat:` 新機能
- `fix:` バグ修正
- `docs:` ドキュメント
- `style:` コードスタイル
- `refactor:` リファクタリング
- `test:` テスト
- `chore:` ビルドツールや補助ツール

### 8.2 例
```
feat: 動画アップロード機能を実装
fix: ファイルサイズ検証のバグを修正
docs: READMEにセットアップ手順を追加
```

## 9. コード品質

### 9.1 ESLint設定
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "no-console": ["warn", { "allow": ["error"] }],
    "@typescript-eslint/no-unused-vars": "error",
    "react/prop-types": "off"
  }
}
```

### 9.2 早期リターン
```typescript
// ✅ Good - 早期リターンでネストを減らす
const processData = (data: Data) => {
  if (!data) return null
  if (data.isEmpty) return []
  
  return data.items.map(transformItem)
}

// ❌ Bad - 深いネスト
const processData = (data: Data) => {
  if (data) {
    if (!data.isEmpty) {
      return data.items.map(transformItem)
    } else {
      return []
    }
  } else {
    return null
  }
}
```