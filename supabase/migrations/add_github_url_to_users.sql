-- 添加 github_url 字段到 users 表（若不存在）
ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS github_url TEXT;

-- 为 github_url 添加索引（便于基于地址或用户名的查询）
CREATE INDEX IF NOT EXISTS idx_users_github_url ON public.users(github_url);

-- 保留已有的 RLS 策略：用户查看自己的信息
-- 若需要允许用户更新自己的资料，增加 UPDATE 策略（仅在不存在时创建）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = '用户更新自己的基本信息'
  ) THEN
    CREATE POLICY "用户更新自己的基本信息" ON public.users
      FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 更新列的更新时间触发器（若项目中已有，请忽略；这里仅作为示例，不强制）
-- 可根据实际情况添加触发器以在 UPDATE 时自动更新 updated_at
-- 示例：
-- CREATE OR REPLACE FUNCTION public.set_updated_at()
-- RETURNS trigger AS $$
-- BEGIN
--   NEW.updated_at := NOW();
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;
-- DROP TRIGGER IF EXISTS users_set_updated_at ON public.users;
-- CREATE TRIGGER users_set_updated_at BEFORE UPDATE ON public.users
--   FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();