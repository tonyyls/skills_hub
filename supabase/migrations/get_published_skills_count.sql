-- 获取已发布技能总数（匿名可调用）
-- 说明：使用 security invoker，遵循调用者权限与 RLS；匿名用户仅统计 status='published'
-- 文档参考：
-- - Supabase Functions: https://supabase.com/docs/guides/database/functions
-- - JavaScript RPC: https://supabase.com/docs/reference/javascript/rpc

create or replace function public.get_published_skills_count()
returns integer
language sql
security invoker
stable
as $$
  select count(*)::int
  from public.skills
  where status = 'published';
$$;

-- 允许匿名与认证用户执行
grant execute on function public.get_published_skills_count() to anon;
grant execute on function public.get_published_skills_count() to authenticated;