-- 添加 author_name 字段到 public.skills 表
-- 允许为空，长度限制 50，默认值为 NULL
ALTER TABLE public.skills
ADD COLUMN IF NOT EXISTS author_name varchar(50);

-- 可选：为现有数据设置默认显示策略（保持 NULL，前端以“官方”兜底）
-- UPDATE public.skills SET author_name = NULL WHERE author_name IS NULL;