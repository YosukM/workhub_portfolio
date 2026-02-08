-- profilesテーブルにis_activeカラムを追加（デフォルトはtrue）
ALTER TABLE profiles ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
