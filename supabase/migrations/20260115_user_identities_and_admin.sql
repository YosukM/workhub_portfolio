-- =====================================================
-- user_identities: プロバイダー別ユーザーマッピング
-- (provider, provider_uid) → user_id の永続マッピング
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_identities (
  provider TEXT NOT NULL,
  provider_uid TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (provider, provider_uid)
);

-- インデックス: user_id で逆引き
CREATE INDEX IF NOT EXISTS idx_user_identities_user_id ON public.user_identities(user_id);

-- RLS設定
ALTER TABLE public.user_identities ENABLE ROW LEVEL SECURITY;

-- service_role のみ操作可能
CREATE POLICY "Service role can manage identities"
  ON public.user_identities
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- admin_users: 管理者ユーザーテーブル
-- user_id ベースで管理者を判定
-- =====================================================

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS設定
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 認証済みユーザーは自分が管理者か確認可能
CREATE POLICY "Users can check own admin status"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- service_role は全操作可能
CREATE POLICY "Service role can manage admins"
  ON public.admin_users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 既存データ移行
-- =====================================================

-- 1. profiles.role = 'admin' のユーザーを admin_users に移行
INSERT INTO public.admin_users (user_id, created_at)
SELECT id, COALESCE(created_at, NOW())
FROM public.profiles
WHERE role = 'admin'
ON CONFLICT (user_id) DO NOTHING;

-- 2. 既存の LINE 連携ユーザーを user_identities に移行
-- (line_user_id が設定されているユーザー)
INSERT INTO public.user_identities (provider, provider_uid, user_id, created_at)
SELECT
  'line',
  LOWER(line_user_id),
  id,
  COALESCE(line_linked_at, NOW())
FROM public.profiles
WHERE line_user_id IS NOT NULL
ON CONFLICT (provider, provider_uid) DO NOTHING;

-- =====================================================
-- ヘルパー関数
-- =====================================================

-- 管理者判定関数
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = p_user_id
  );
$$;

-- 現在のユーザーが管理者か判定
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
  );
$$;

-- provider_uid から user_id を取得
CREATE OR REPLACE FUNCTION public.get_user_id_by_identity(p_provider TEXT, p_provider_uid TEXT)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT user_id
  FROM public.user_identities
  WHERE provider = p_provider AND provider_uid = LOWER(p_provider_uid)
  LIMIT 1;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_id_by_identity(TEXT, TEXT) TO service_role;
