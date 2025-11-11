-- 删除由种子用户创建的技能数据（按作者邮箱匹配）
-- 使用前请确认邮箱一致，默认 seed@example.com
-- 可选：将 email 替换为部署环境中使用的种子邮箱

BEGIN;
  -- 先查出种子用户 ID（auth.users 存在于 auth schema）
  WITH seed_user AS (
    SELECT id FROM auth.users WHERE email = 'seed@example.com'
  )
  DELETE FROM public.user_favorites WHERE skill_id IN (
    SELECT id FROM public.skills WHERE author_id IN (SELECT id FROM seed_user)
  );

  DELETE FROM public.skills WHERE author_id IN (SELECT id FROM seed_user);
COMMIT;

-- 使用方法（本地 cli 或 SQL 控制台执行）：
-- \i supabase/scripts/clean_seed_skills.sql