# 最終確認事項と推奨事項

## 追加の確認事項

### 1. Gemini APIプロンプト設計
- **動画解析の具体的な指示内容**
  - 操作手順の抽出基準（クリック、入力、画面遷移など）
  - スクリーンショット取得タイミングの判断基準
  - 出力フォーマットの指定方法

### 2. Cloudinary API設定
- **動画処理オプション**
  - 動画からフレーム抽出する際の品質設定
  - 画像最適化のパラメータ（圧縮率、フォーマット）
  - 一時URLの有効期限設定

### 3. Supabase Edge Functions
- **関数の分割設計**
  - 動画アップロード処理
  - Gemini API呼び出し処理
  - Cloudinary連携処理
  - マニュアル生成処理
- **タイムアウト設定**（デフォルト30秒では不足の可能性）

### 4. エラー処理の詳細
- **各種エラーケースの想定**
  - API制限エラー
  - ファイルサイズ超過
  - 非対応動画形式
  - ネットワークエラー
- **ユーザーへの通知方法**

## 推奨事項

### 1. アーキテクチャ設計
```
フロントエンド（Netlify）
    ↓
Supabase Edge Functions
    ├── 動画一時保存 → Supabase Storage
    ├── 動画解析 → Gemini API
    ├── SS抽出 → Cloudinary API
    └── 画像保存 → Supabase Storage
```

### 2. セキュリティ考慮事項
- **CORS設定**: Netlifyドメインからのみアクセス許可
- **API Key管理**: 
  - Gemini API Key → Edge Functions環境変数
  - Cloudinary API Key → Edge Functions環境変数
  - Supabase anon key → フロントエンド環境変数（public）

### 3. パフォーマンス最適化
- **並列処理の活用**
  - Gemini API解析とCloudinary処理を並列実行
- **キャッシュ戦略**
  - 生成済みマニュアルの一時キャッシュ（1時間）

### 4. UI/UX改善案
- **プログレス表示の詳細化**
  - アップロード進捗: 0-30%
  - 動画解析中: 30-60%
  - 画像抽出中: 60-80%
  - マニュアル生成中: 80-100%

### 5. 将来の拡張に向けた設計
- **データベース設計**（将来の履歴機能用）
  ```sql
  -- manuals テーブル（将来用）
  id, user_id, title, content, language, detail_level, created_at
  ```

- **APIレスポンス形式の統一**
  ```json
  {
    "success": boolean,
    "data": any,
    "error": string | null
  }
  ```

### 6. 開発順序の推奨
1. Supabaseプロジェクトセットアップ
2. フロントエンド基本構築（アップロードUI）
3. Edge Functions基本実装
4. Cloudinary連携実装
5. Gemini API連携実装
6. マニュアル表示機能実装
7. エラーハンドリング強化
8. UI/UXブラッシュアップ

### 7. テスト用サンプル
- **テスト動画の準備**
  - 短い動画（30秒程度）でまず動作確認
  - 各種フォーマット（MP4、MOV）でテスト

### 8. 監視・ログ
- **基本的なログ出力**
  - Edge Functionsでconsole.log（Supabaseダッシュボードで確認可能）
  - フロントエンドエラーはconsole.errorで出力

これらの確認事項について追加の質問や、実装開始前に決めておきたい点はありますか？