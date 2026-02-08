# Supabase Database Setup Guide

## 概要
WorkHubのデータベースセットアップ手順書です。

## 前提条件
- Supabaseプロジェクトが作成済みであること
- `.env.local` に `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` が設定されていること

## セットアップ手順

### 1. Supabase管理画面にアクセス
```
https://app.supabase.com/project/YOUR_PROJECT_ID
```

### 2. SQL Editorでマイグレーションを実行

#### 手順
1. 左サイドバーから **SQL Editor** を選択
2. **New query** をクリック
3. `supabase/migrations/20260108_initial_schema.sql` の内容をコピー&ペースト
4. **Run** ボタンをクリックして実行

#### 実行後の確認
以下のテーブルが作成されていることを確認：
- `public.profiles`
- `public.reports`

### 3. テーブル構造の確認

#### Profiles テーブル
| カラム名 | 型 | 説明 |
|---------|---|------|
| id | UUID | ユーザーID (auth.usersのFK) |
| email | TEXT | メールアドレス |
| name | TEXT | ユーザー名 |
| role | TEXT | ロール (admin/member) |
| created_at | TIMESTAMPTZ | 作成日時 |
| updated_at | TIMESTAMPTZ | 更新日時 |

#### Reports テーブル
| カラム名 | 型 | 説明 |
|---------|---|------|
| id | UUID | レポートID |
| user_id | UUID | ユーザーID (profilesのFK) |
| report_date | DATE | 報告日 |
| yesterday_tasks | JSONB | 昨日の実績タスク配列 |
| today_tasks | JSONB | 今日の予定タスク配列 |
| notes | TEXT | 困りごと・相談 |
| submitted_at | TIMESTAMPTZ | 提出日時 |
| created_at | TIMESTAMPTZ | 作成日時 |
| updated_at | TIMESTAMPTZ | 更新日時 |

### 4. Row Level Security (RLS) の確認

以下のポリシーが設定されていることを確認：

#### Profiles テーブル
- ✅ Users can view own profile
- ✅ Admins can view all profiles
- ✅ Users can update own profile

#### Reports テーブル
- ✅ Users can manage own reports
- ✅ Admins can view all reports

### 5. 初期ユーザーの作成（管理者）

#### Authentication経由で管理者を作成
1. アプリケーションのサインアップページからユーザー登録
2. Supabase管理画面 > **Table Editor** > **profiles** を開く
3. 作成されたユーザーの `role` を `member` から `admin` に変更

または、SQL Editorで直接更新：
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-admin@example.com';
```

## テストデータの挿入（任意）

開発・テスト用にサンプルデータを挿入する場合：

```sql
-- メンバーユーザーのレポート作成（既存ユーザーIDを使用）
INSERT INTO public.reports (user_id, report_date, yesterday_tasks, today_tasks, notes)
VALUES (
  'YOUR_USER_ID_HERE',
  CURRENT_DATE,
  '[
    {"task_name": "ログイン機能の実装", "actual_hours": 3.5},
    {"task_name": "データベース設計", "actual_hours": 2.0}
  ]'::jsonb,
  '[
    {"task_name": "ダッシュボード画面の実装", "planned_hours": 4.0},
    {"task_name": "API連携テスト", "planned_hours": 2.0}
  ]'::jsonb,
  '特になし'
);
```

## トラブルシューティング

### エラー: `relation "auth.users" does not exist`
- Supabaseプロジェクトが正しく初期化されていない可能性があります
- プロジェクトを再作成するか、Supabaseサポートに問い合わせてください

### RLSポリシーが効かない
- テーブルのRLSが有効化されているか確認：
  ```sql
  SELECT tablename, rowsecurity
  FROM pg_tables
  WHERE schemaname = 'public';
  ```

### トリガーが動作しない
- 関数とトリガーが正しく作成されているか確認：
  ```sql
  SELECT * FROM pg_trigger WHERE tgname LIKE '%update%';
  ```

## 次のステップ

データベースセットアップが完了したら：
1. TypeScript型定義の作成
2. ダッシュボード画面の実装
3. 報告入力機能の実装

---

**作成日**: 2026-01-08
**更新日**: 2026-01-08
