-- 删除由种子用户创建的技能数据（按作者邮箱匹配）
-- 默认邮箱 seed@example.com；如不同请在执行前替换

BEGIN;
  -- 删除由种子用户创建的收藏记录（CTE 作用域仅对单条语句有效，分别声明）
  WITH seed_user AS (
    SELECT id FROM auth.users WHERE email = 'seed@example.com'
  ), seed_skills AS (
    SELECT id FROM public.skills WHERE author_id IN (SELECT id FROM seed_user)
  )
  DELETE FROM public.user_favorites WHERE skill_id IN (SELECT id FROM seed_skills);

  -- 删除由种子用户创建的技能记录
  WITH seed_user AS (
    SELECT id FROM auth.users WHERE email = 'seed@example.com'
  )
  DELETE FROM public.skills WHERE author_id IN (SELECT id FROM seed_user);
COMMIT;