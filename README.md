# TeamWork Tracker (WorkHub)

**社内チームメンバーの業務内容（予実）と稼働時間を可視化し、管理者が「業務が計画通り進んでいるか」を即座に判断するためのWebアプリケーション**

このプロジェクトは、日々の業務報告（日報）をシステム化し、予実管理と稼働時間の自動集計を実現するために開発されました。

---

## 🚀 主な機能

### 1. 認証機能 (Authentication)
- **マルチログイン対応**: メールアドレス/パスワードに加え、Googleアカウント、LINEアカウントでのログイン（OAuth）に対応。
- **アカウント連携**: 既存アカウントへのLINE連携機能。
- **セキュアな管理**: Supabase Authを利用した堅牢な認証システム。

### 2. 日次報告 (Daily Reporting)
- **予実管理**: 「昨日の実績」と「今日の予定」を並列で入力・管理。
- **入力負荷軽減**: 前日の「今日の予定」を自動で「昨日の実績」に引き継ぐ機能により、入力の手間を大幅に削減。
- **モバイルファースト**: スマホからでも数分で完了できるUI設計。

### 3. ダッシュボード (Dashboard)
- **リアルタイム可視化**: メンバー全員の報告状況をカード形式で一覧表示。
- **未提出アラート**: 報告が遅れているメンバーを視覚的に強調（赤字表示）。
- **統計情報**: 提出率、合計稼働時間などのKPIを自動集計して表示。

### 4. LINE連携 (LINE Integration)
- **リマインド通知**: 毎朝9:00に未提出者へ自動でリマインドを送信（Vercel Cron連携）。
- **ワンタップログイン**: LINEブラウザからのシームレスなログイン体験。

### 5. 管理者機能 (Admin Tools)
- **ユーザー管理**: メンバーの追加・削除・権限変更。
- **データエクスポート**: 稼働データをCSV形式でダウンロードし、外部ツール（Excel/Spreadsheet）での分析に活用可能。

---

## 🛠 技術スタック

| カテゴリ | 技術 | 選定理由 |
|---------|------|------|
| **Frontend** | Next.js 15 (App Router) | 最新のReact機能、SEO、高速なページ遷移 |
| **Language** | TypeScript | 型安全性による保守性の向上 |
| **Styling** | Tailwind CSS + shadcn/ui | 高速なUI構築と一貫したデザインシステム |
| **Backend / DB** | Supabase | Auth, PostgreSQL, Realtime APIを一元管理 |
| **Infrastructure** | Vercel | Next.jsに最適化されたホスティング、Cron Jobs |
| **Integration** | LINE Messaging API | 日本国内で最も到達率の高い通知手段 |

---

## 📂 ディレクトリ構成（主要部分）

```
/app
  /actions    # Server Actions (DB操作などのバックエンドロジック)
  /api        # Route Handlers (Webhook, Cron, External API)
  /dashboard  # メイン機能（一覧表示）
  /report     # 報告入力ページ
/components   # 再利用可能なUIコンポーネント
/lib          # ユーティリティ関数、Supabaseクライアント
/supabase     # DBマイグレーションファイル、型定義
```

---

## 📖 ドキュメント

詳細な設計思想、要件定義、DBスキーマについては、同梱の [DESIGN_DOC.md](./DESIGN_DOC.md) をご参照ください。

---

## 💻 セットアップ手順 (ローカル開発)

1. **リポジトリのクローン**
   ```bash
   git clone <repository-url>
   cd llotus_workhub
   ```

2. **依存パッケージのインストール**
   ```bash
   npm install
   ```

3. **環境変数の設定**
   `.env.example` をコピーして `.env.local` を作成し、SupabaseおよびLINE APIのキーを設定してください。

4. **開発サーバーの起動**
   ```bash
   npm run dev
   ```
   ブラウザで `http://localhost:3000` にアクセスします。

---

*This project is a portfolio piece demonstrating Full Stack development capabilities using Next.js and Supabase.*
