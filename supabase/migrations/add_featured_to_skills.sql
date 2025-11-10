-- 为 skills 表添加 featured 字段，用于标记精选技能
-- 安全性：仅新增布尔字段，默认 false，不影响现有查询

ALTER TABLE public.skills
ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false;

-- 可选：为后续查询添加索引（提升首页精选查询性能）
CREATE INDEX IF NOT EXISTS skills_featured_idx ON public.skills (featured);