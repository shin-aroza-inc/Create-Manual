# コントリビューションガイド

このプロジェクトへのコントリビューションを歓迎します！

## 開発環境のセットアップ

1. **前提条件**
   - Node.js v20 LTS
   - npm または pnpm
   - Supabase CLI

2. **リポジトリのクローン**
   ```bash
   git clone https://github.com/your-username/Create-Manual.git
   cd Create-Manual
   ```

3. **依存関係のインストール**
   ```bash
   cd frontend
   npm install
   ```

4. **環境変数の設定**
   ```bash
   cp .env.example .env
   # .envファイルを編集して必要な値を設定
   ```

5. **開発サーバーの起動**
   ```bash
   npm run dev
   ```

## コントリビューションの流れ

1. **Issue の確認**
   - 既存のIssueを確認
   - 新しい機能や修正の提案はIssueで議論

2. **フォークとブランチ作成**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **開発**
   - コーディング規約に従って実装
   - コミットメッセージは分かりやすく記述

4. **テスト**
   ```bash
   npm run lint
   npm run type-check
   npm run build
   ```

5. **Pull Request**
   - 変更内容を明確に記述
   - レビュー可能な単位で分割

## コーディング規約

### TypeScript
- Strict モードを使用
- Interface を優先使用
- Named exports を推奨

### React
- Function components を使用
- Custom hooks でロジックを分離
- Props の型定義を徹底

### 命名規則
- **コンポーネント**: PascalCase (`VideoUploader`)
- **関数・変数**: camelCase (`uploadVideo`)
- **定数**: UPPER_SNAKE_CASE (`API_ENDPOINTS`)
- **ファイル**: kebab-case (`video-upload.ts`)

### コミットメッセージ

```
type(scope): description

例:
feat(upload): add video upload validation
fix(ui): resolve button alignment issue
docs(readme): update setup instructions
```

**Type:**
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント更新
- `style`: フォーマットやスタイル変更
- `refactor`: リファクタリング
- `test`: テスト関連
- `chore`: その他

## 品質チェック

以下のコマンドが全て成功することを確認してください：

```bash
# リンティング
npm run lint

# 型チェック
npm run type-check

# ビルド
npm run build
```

## Pull Request ガイドライン

### 必須項目
- [ ] 変更内容の明確な説明
- [ ] 関連するIssueの番号
- [ ] 破壊的変更の有無
- [ ] テスト済みであることの確認

### 推奨項目
- [ ] スクリーンショット（UI変更の場合）
- [ ] パフォーマンスへの影響
- [ ] セキュリティへの影響

### レビュープロセス
1. 自動チェック（CI/CD）の通過
2. コードレビューの実施
3. 必要に応じて修正
4. マージ

## 対応しているコントリビューション

### 歓迎する貢献
- バグ修正
- 新機能の実装
- パフォーマンス改善
- ドキュメント改善
- テストの追加
- 翻訳の追加

### 貢献前の相談が必要
- アーキテクチャの大幅な変更
- 依存関係の追加
- 新しい言語サポート
- 外部サービスとの統合

## 行動規範

- 建設的なフィードバックを心がける
- 他の参加者を尊重する
- 包括的で歓迎的なコミュニティを維持する

## 質問・サポート

- **一般的な質問**: GitHub Discussions
- **バグ報告**: GitHub Issues
- **セキュリティ**: Security Advisory

## ライセンス

このプロジェクトにコントリビューションすることで、あなたの貢献がMITライセンスの下で公開されることに同意したものとします。