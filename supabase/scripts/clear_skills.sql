-- 清空 skills 表数据并重置相关序列/计数（若有）
-- 注意：此操作不可逆，请谨慎执行

BEGIN;
  -- 删除关联记录（如收藏）以避免外键约束问题
  DELETE FROM public.user_favorites WHERE skill_id IN (SELECT id FROM public.skills);

  -- 清空技能表
  DELETE FROM public.skills;
COMMIT;