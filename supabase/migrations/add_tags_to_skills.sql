-- 为 public.skills 添加 tags 字段（文本数组）
-- 参考：PostgreSQL 数组类型 https://www.postgresql.org/docs/current/arrays.html

ALTER TABLE public.skills
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::text[];

COMMENT ON COLUMN public.skills.tags IS '技能标签（文本数组），用于前端展示与筛选';