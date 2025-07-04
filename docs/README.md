# ドキュメント構成

このディレクトリには、プロジェクトの設計・開発に関するドキュメントが含まれています。

## 📁 フォルダ構成

### 📋 requirements/ - 要件定義
- `requirements.md` - 機能要件・非機能要件の詳細
- `tech-stack.md` - 使用技術スタックの選定理由
- `additional-considerations.md` - 追加確認事項と回答
- `final-considerations.md` - 最終確認事項と推奨事項

### 🏗️ architecture/ - アーキテクチャ設計
- `project-structure.md` - プロジェクトのフォルダ構成とファイル命名規則

### 💻 development/ - 開発ガイドライン
- `coding-standards.md` - コーディング規約（TypeScript, React, Supabase）
- `git-workflow.md` - Git運用ルール（ブランチ戦略、コミット規則）
- `development-setup.md` - 開発環境のセットアップ手順

## 🚀 クイックリンク

### 開発を始める前に
1. [要件定義書](requirements/requirements.md) - プロジェクトの要件を理解
2. [開発環境セットアップ](development/development-setup.md) - 環境構築手順
3. [コーディング規約](development/coding-standards.md) - コーディングルール

### 開発中の参照
- [プロジェクト構成](architecture/project-structure.md) - ファイル配置の確認
- [Git運用ルール](development/git-workflow.md) - ブランチ・コミットルール
- [技術スタック](requirements/tech-stack.md) - 使用ライブラリの確認

## 📝 ドキュメント更新ルール

1. **更新時期**: 仕様変更や新しい決定事項が発生した際
2. **更新方法**: 該当するドキュメントを直接編集
3. **レビュー**: 重要な変更はPRでレビューを受ける

## 🔍 参照順序（推奨）

1. **プロジェクト理解**
   - requirements/requirements.md
   - requirements/tech-stack.md

2. **開発準備**
   - development/development-setup.md
   - development/coding-standards.md

3. **開発作業**
   - architecture/project-structure.md
   - development/git-workflow.md

4. **追加情報**（必要に応じて）
   - requirements/additional-considerations.md
   - requirements/final-considerations.md