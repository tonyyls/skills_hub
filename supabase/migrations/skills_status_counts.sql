-- 聚合技能状态分布的数据库函数
-- 官方参考：Database Functions https://supabase.com/docs/guides/database/functions
-- 说明：返回 published/draft/archived 以及 total 的计数，便于前端一次获取

create or replace function public.skills_status_counts()
returns table(status text, count bigint)
language sql
security definer
set search_path = public
as $$
  -- 按状态分组计数
  select status::text as status, count(*)::bigint as count
  from public.skills
  group by status
  union all
  -- 总数计数
  select 'total'::text as status, count(*)::bigint as count
  from public.skills;
$$;

comment on function public.skills_status_counts() is 'Aggregate counts for skills by status plus total';