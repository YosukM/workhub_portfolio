-- WorkHub: Initial Database Schema
-- Created: 2026-01-08

-- ============================================
-- 1. Profiles Table (ユーザープロフィール拡張)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- プロフィールテーブルのインデックス
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- ============================================
-- 2. Reports Table (日次報告)
-- ============================================
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,

  -- 昨日の実績
  yesterday_tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- 構造: [{ "task_name": "タスク名", "actual_hours": 2.5 }]

  -- 今日の予定
  today_tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- 構造: [{ "task_name": "タスク名", "planned_hours": 3.0 }]

  -- 困りごと・相談
  notes TEXT,

  -- 提出日時
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- レコード管理
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 1日1レポートの制約
  CONSTRAINT unique_user_report_date UNIQUE(user_id, report_date)
);

-- レポートテーブルのインデックス
CREATE INDEX idx_reports_user_id ON public.reports(user_id);
CREATE INDEX idx_reports_report_date ON public.reports(report_date);
CREATE INDEX idx_reports_submitted_at ON public.reports(submitted_at);

-- ============================================
-- 3. Row Level Security (RLS) Policies
-- ============================================

-- 管理者判定関数（RLSをバイパスして無限再帰を防止）
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles テーブルのRLS有効化
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 自分のプロフィールは閲覧可能
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- 管理者は全員のプロフィールを閲覧可能
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.is_admin());

-- 自分のプロフィールは更新可能
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Reports テーブルのRLS有効化
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 自分のレポートは全操作可能
CREATE POLICY "Users can manage own reports"
  ON public.reports
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 管理者は全員のレポートを閲覧可能
CREATE POLICY "Admins can view all reports"
  ON public.reports
  FOR SELECT
  USING (public.is_admin());

-- ============================================
-- 4. Functions & Triggers
-- ============================================

-- updated_atを自動更新する関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Profiles テーブルのupdated_at自動更新トリガー
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Reports テーブルのupdated_at自動更新トリガー
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 新規ユーザー登録時にプロフィールを自動作成する関数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'member')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 新規ユーザー作成時のトリガー
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 5. Sample Data (開発用)
-- ============================================

-- Note: 本番環境では以下のサンプルデータは削除してください
-- サンプルデータはSupabase管理画面から手動で作成することを推奨します
