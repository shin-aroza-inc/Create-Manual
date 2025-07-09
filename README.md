# 🎥 マニュアル自動生成アプリケーション

動画から自動的に画像付きマニュアル（Markdown形式）を生成するWebアプリケーション

## ✨ 機能

- 🎬 **動画アップロード**: MP4, MOV, AVI, WebM形式に対応（最大500MB、10分）
- 🤖 **AI解析**: Gemini APIによる動画内容の自動解析
- 📸 **スクリーンショット自動抽出**: Cloudinary APIで重要シーンを特定
- 📝 **マニュアル自動生成**: ステップバイステップの手順書をMarkdown形式で生成
- 🌍 **多言語対応**: 日本語・英語
- ⚙️ **詳細度選択**: 簡潔・詳細の2段階
- 💾 **ダウンロード機能**: 生成されたマニュアルをファイルとして保存

## 🏗️ アーキテクチャ

### 技術スタック
- **フロントエンド**: React + TypeScript + Vite + Tailwind CSS
- **バックエンド**: Supabase Edge Functions (Deno)
- **AI**: Gemini 2.5 Flash API
- **画像処理**: Cloudinary API
- **ストレージ**: Supabase Storage
- **デプロイ**: Netlify (Frontend) + Supabase (Backend)

### システム構成
```
フロントエンド (Netlify)
    ↓
Supabase Edge Functions
    ├── 動画一時保存 → Supabase Storage
    ├── AI解析 → Gemini API
    ├── 画像抽出 → Cloudinary API
    └── 画像保存 → Supabase Storage
```

## 🚀 クイックスタート

### 前提条件
- Node.js v20 LTS
- Supabase アカウント
- Gemini API キー
- Cloudinary アカウント

### ローカル開発

1. **リポジトリクローン**
```bash
git clone https://github.com/your-username/Create-Manual.git
cd Create-Manual
```

2. **フロントエンド設定**
```bash
cd frontend
npm install
cp .env.example .env
# .envファイルを編集してAPI keyを設定
npm run dev
```

3. **Supabase設定**
```bash
# supabase-setup.md を参照
# 必要なバケットの作成、環境変数の設定等
```

## 📁 プロジェクト構成

```
Create-Manual/
├── docs/                    # ドキュメント
│   ├── requirements/        # 要件定義
│   ├── architecture/        # アーキテクチャ設計
│   └── development/         # 開発ガイド
├── frontend/               # React アプリケーション
│   ├── src/
│   │   ├── components/     # UIコンポーネント
│   │   ├── hooks/         # カスタムフック
│   │   ├── lib/           # ユーティリティ
│   │   ├── types/         # 型定義
│   │   └── constants/     # 定数
└── supabase/              # Edge Functions
    └── functions/
        ├── _shared/       # 共通ライブラリ
        └── process-video/ # メイン処理
```

## 🔧 詳細設定

### Supabase設定
完全な設定手順は [`supabase-setup.md`](supabase-setup.md) を参照してください。
- ストレージバケットの作成
- Row Level Securityの設定  
- 自動クリーンアップ機能の設定
- 環境変数の設定

## 🎯 使用方法

1. **動画アップロード**: 操作動画をドラッグ&ドロップまたは選択
2. **オプション設定**: 言語（日本語/英語）と詳細度（簡潔/詳細）を選択
3. **マニュアル生成**: 「マニュアル作成」ボタンを押下
4. **結果確認**: 生成されたマニュアルを確認・ダウンロード

## 🔄 処理フロー

1. 動画ファイルをSupabase Storageにアップロード
2. Gemini APIで動画内容を解析、重要シーンのタイムスタンプを特定
3. Cloudinary APIで指定タイムスタンプのスクリーンショットを抽出
4. 抽出した画像をSupabase Storageに保存
5. 解析結果と画像を組み合わせてMarkdown形式のマニュアルを生成

## 🛠️ 開発コマンド

### フロントエンド
```bash
npm run dev        # 開発サーバー起動
npm run build      # プロダクションビルド
npm run lint       # ESLint実行
npm run format     # Prettier実行
npm run type-check # TypeScript型チェック
```

### Supabase
```bash
supabase start                        # ローカル環境起動
supabase functions serve process-video # Edge Function ローカル実行
supabase functions deploy process-video # デプロイ
```

## 📊 制約事項

- **ファイルサイズ**: 最大500MB
- **動画長さ**: 最大10分
- **対応形式**: MP4, MOV, AVI, WebM
- **同時処理**: 1ユーザー1処理まで
- **ファイル保存期間**: 
  - 動画: 15分後に自動削除
  - 画像: 15分後に自動削除

## 🔐 セキュリティ

- Supabase Storage: プライベートバケット使用（画像）
- 署名付きURL: 1時間の有効期限
- API キー: 環境変数で管理
- CORS: 適切なヘッダー設定
- 動画ファイル: 15分後に自動削除
- 画像ファイル: 15分後に自動削除

## 🚢 デプロイ

### Netlify (フロントエンド)
1. GitHubリポジトリと連携
2. ビルド設定: `cd frontend && npm run build`
3. 公開ディレクトリ: `frontend/dist`
4. 環境変数を設定

### Supabase (バックエンド)
```bash
supabase functions deploy process-video
```

## 🐛 トラブルシューティング

よくある問題と解決方法は [docs/development/supabase-setup-manual.md](docs/development/supabase-setup-manual.md#-トラブルシューティング) を参照

## 📈 今後の拡張予定

- [ ] ユーザー認証機能
- [ ] 履歴管理機能  
- [x] PDFエクスポート機能
- [ ] マニュアルテンプレート機能
- [ ] 共同編集機能
- [ ] より多くの言語対応

## 🤝 コントリビューション

1. Forkしてブランチ作成: `git checkout -b feature/new-feature`
2. 変更をコミット: `git commit -m 'feat: add new feature'`
3. ブランチにプッシュ: `git push origin feature/new-feature`
4. Pull Requestを作成

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照

## 📞 サポート

- 📖 [ドキュメント](docs/)
- 🐛 [Issue報告](https://github.com/your-username/Create-Manual/issues)
- 💬 [ディスカッション](https://github.com/your-username/Create-Manual/discussions)