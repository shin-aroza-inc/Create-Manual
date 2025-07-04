# Git運用ルール

## ブランチ戦略

### ブランチ構成
```
main (本番環境)
├── develop (開発環境)
│   ├── feature/* (機能開発)
│   ├── fix/* (バグ修正)
│   └── refactor/* (リファクタリング)
```

### ブランチ命名規則
- **機能開発**: `feature/動詞-名詞` (例: `feature/add-video-upload`)
- **バグ修正**: `fix/動詞-名詞` (例: `fix/validate-file-size`)
- **リファクタリング**: `refactor/対象` (例: `refactor/api-client`)

### ブランチ運用ルール
1. **mainブランチ**: 直接プッシュ禁止、developからのマージのみ
2. **developブランチ**: 各featureブランチからのマージ先
3. **featureブランチ**: developから作成、作業完了後にdevelopへマージ

## コミットルール

### コミットメッセージ形式
```
<type>: <subject>

[optional body]

[optional footer]
```

### Type一覧
- `feat`: 新機能追加
- `fix`: バグ修正
- `docs`: ドキュメント変更
- `style`: コードスタイル変更（動作に影響なし）
- `refactor`: リファクタリング
- `perf`: パフォーマンス改善
- `test`: テスト追加・修正
- `chore`: ビルドプロセスやツールの変更
- `ci`: CI/CD設定の変更

### コミット例
```bash
# 良い例
git commit -m "feat: 動画アップロード機能を実装"
git commit -m "fix: 10MB以上のファイルアップロード時のエラーを修正"
git commit -m "docs: READMEにセットアップ手順を追加"

# 悪い例
git commit -m "更新"
git commit -m "バグ修正"
git commit -m "WIP"
```

### コミット粒度
- 1つのコミットに1つの変更
- 論理的にまとまった単位でコミット
- WIPコミットは避ける（どうしても必要な場合はfeatureブランチで）

## プルリクエスト（PR）ルール

### PRテンプレート
```markdown
## 概要
[変更内容の簡潔な説明]

## 変更内容
- [ ] 機能A を実装
- [ ] バグB を修正
- [ ] ドキュメントC を更新

## 動作確認
- [ ] ローカルで動作確認済み
- [ ] エラーハンドリング確認済み
- [ ] レスポンシブ対応確認済み

## スクリーンショット
[必要に応じて画面キャプチャを添付]

## 関連Issue
- #123

## レビュー観点
[レビュアーに特に見てほしいポイント]
```

### PR作成ルール
1. **タイトル**: コミットメッセージと同じ形式
2. **説明**: テンプレートに従って記載
3. **レビュアー**: 必ず1名以上指定
4. **ラベル**: 適切なラベルを付与

## マージルール

### マージ前チェックリスト
- [ ] コードレビュー承認済み
- [ ] コンフリクト解消済み
- [ ] ビルドエラーなし
- [ ] ESLintエラーなし
- [ ] 動作確認済み

### マージ戦略
- **feature → develop**: Squash and merge（コミット履歴を整理）
- **develop → main**: Create a merge commit（履歴を保持）

## タグ・リリース

### バージョニング
セマンティックバージョニング（SemVer）を採用
```
v1.2.3
│ │ └─ パッチ: バグ修正
│ └─── マイナー: 機能追加（後方互換性あり）
└───── メジャー: 破壊的変更
```

### タグ付けルール
```bash
# リリースタグ
git tag -a v1.0.0 -m "初回リリース"
git push origin v1.0.0

# プレリリースタグ
git tag -a v1.0.0-beta.1 -m "ベータリリース"
```

## 開発フロー例

### 1. 新機能開発
```bash
# developブランチから作成
git checkout develop
git pull origin develop
git checkout -b feature/add-manual-export

# 開発作業
# ...

# コミット
git add .
git commit -m "feat: マニュアルエクスポート機能を追加"

# プッシュ
git push origin feature/add-manual-export

# PR作成 → レビュー → マージ
```

### 2. ホットフィックス
```bash
# mainブランチから作成（緊急時のみ）
git checkout main
git pull origin main
git checkout -b fix/critical-upload-error

# 修正作業
# ...

# コミット&プッシュ
git add .
git commit -m "fix: アップロード時のクリティカルエラーを修正"
git push origin fix/critical-upload-error

# PR作成 → 緊急レビュー → main/developへマージ
```

## .gitattributes設定

```gitattributes
# 改行コードをLFに統一
* text=auto eol=lf

# バイナリファイル
*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.ico binary
*.mp4 binary
*.mov binary
*.avi binary
*.webm binary

# 言語統計から除外
docs/* linguist-documentation
*.md linguist-documentation
```

## コラボレーション

### Issue運用
1. **バグ報告**: バグテンプレート使用
2. **機能要望**: 機能要望テンプレート使用
3. **ラベル付け**: 優先度・種類を明確化

### コードレビュー指針
1. **建設的**: 改善提案は具体的に
2. **迅速**: 24時間以内にレビュー開始
3. **重点**: ロジック > スタイル

### コンフリクト解決
1. **最新化**: developの最新を取り込む
2. **慎重**: 両方の変更を理解してから解決
3. **確認**: 解決後は必ず動作確認

## セキュリティ

### 機密情報の扱い
- APIキーは絶対にコミットしない
- .envファイルは.gitignoreに含める
- 誤ってコミットした場合は即座に無効化&履歴から削除

### 依存関係
- 定期的に`npm audit`を実行
- 脆弱性が見つかったら速やかに対応