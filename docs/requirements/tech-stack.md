# 技術スタック選定

## フロントエンド
- **React**: UIライブラリ
- **Vite**: 高速なビルドツール
- **TypeScript**: 型安全性の確保
- **Tailwind CSS**: ユーティリティファーストCSS
- **Shadcn/ui**: 洗練されたUIコンポーネント
- **React Hook Form**: フォーム管理
- **Zod**: バリデーション
- **i18next**: 多言語対応（日本語/英語）
- **react-markdown**: Markdownレンダリング

## バックエンド
- **Supabase Edge Functions**: サーバーレス関数（Deno環境）
- **TypeScript**: 型安全性の確保

## 外部サービス
- **Supabase Storage**: 画像ファイル保存
- **Gemini API**: 動画解析
- **Cloudinary API**: 動画処理・スクリーンショット抽出

## 開発ツール
- **ESLint**: コード品質管理
- **Prettier**: コードフォーマット
- **pnpm**: パッケージマネージャー
- **Node.js**: v20 LTS（推奨）

## デプロイ
- **Netlify**: フロントエンドホスティング（Git連携）
- **Supabase**: バックエンド・データベース・ストレージ

## 環境設定
- **環境変数**: 
  - フロントエンド: .envファイル（ローカル）、Netlify環境変数（本番）
  - Edge Functions: Supabaseダッシュボードで設定