-- LINE Integration: Add columns to profiles table
-- Created: 2026-01-09

-- ============================================
-- 1. Add LINE integration columns to profiles
-- ============================================

-- LINE ユーザーID（連携後に設定）
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS line_user_id TEXT UNIQUE;

-- LINE 連携用の一時コード（6桁）
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS line_linking_code TEXT;

-- LINE 連携コードの有効期限
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS line_linking_code_expires_at TIMESTAMP WITH TIME ZONE;

-- LINE 連携完了日時
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS line_linked_at TIMESTAMP WITH TIME ZONE;

-- インデックス追加
CREATE INDEX IF NOT EXISTS idx_profiles_line_user_id ON public.profiles(line_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_line_linking_code ON public.profiles(line_linking_code);

-- ============================================
-- 2. LINE連携コード生成関数
-- ============================================

CREATE OR REPLACE FUNCTION public.generate_line_linking_code(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
BEGIN
  -- 6桁のランダムコードを生成
  new_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');

  -- プロフィールを更新
  UPDATE public.profiles
  SET
    line_linking_code = new_code,
    line_linking_code_expires_at = NOW() + INTERVAL '10 minutes'
  WHERE id = user_id;

  RETURN new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. LINE連携完了関数
-- ============================================

CREATE OR REPLACE FUNCTION public.complete_line_linking(p_linking_code TEXT, p_line_user_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- 有効な連携コードを検索
  SELECT id INTO v_user_id
  FROM public.profiles
  WHERE line_linking_code = p_linking_code
    AND line_linking_code_expires_at > NOW()
    AND line_user_id IS NULL;

  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- LINE連携を完了
  UPDATE public.profiles
  SET
    line_user_id = p_line_user_id,
    line_linked_at = NOW(),
    line_linking_code = NULL,
    line_linking_code_expires_at = NULL
  WHERE id = v_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. LINE連携解除関数
-- ============================================

CREATE OR REPLACE FUNCTION public.unlink_line(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.profiles
  SET
    line_user_id = NULL,
    line_linked_at = NULL,
    line_linking_code = NULL,
    line_linking_code_expires_at = NULL
  WHERE id = user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
