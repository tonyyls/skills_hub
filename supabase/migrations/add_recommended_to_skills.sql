-- 添加 recommended 列到 skills 表
-- 安全：布尔型，默认 false，不可为空
ALTER TABLE public.skills
  ADD COLUMN IF NOT EXISTS recommended boolean NOT NULL DEFAULT false;

-- 为已有数据设置默认值（Postgres 已处理 DEFAULT），确保列存在
COMMENT ON COLUMN public.skills.recommended IS '是否为推荐技能';