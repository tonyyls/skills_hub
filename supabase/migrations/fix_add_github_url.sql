-- 修复迁移：为 public.users 表添加 github_url 字段与索引
-- 目标：解决错误 column users.github_url does not exist
-- 设计：
-- 1) 确保 users 表存在（若不存在则创建一个基础结构）
-- 2) 添加 github_url 字段（TEXT，允许 NULL），避免重复执行报错
-- 3) 创建索引 idx_users_github_url（若不存在）
-- 4) 所有操作使用 IF NOT EXISTS 或条件判断，确保幂等

BEGIN;

-- 1) 确保 schema 存在
CREATE SCHEMA IF NOT EXISTS public;

-- 2) 确保 users 表存在：仅在不存在时创建基础结构
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY,
  username text,
  avatar_url text,
  bio text,
  email text,
  created_at timestamptz DEFAULT now()
);

-- 3) 添加 github_url 字段（允许为空），避免重复执行
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS github_url text;

-- 4) 创建索引，避免重复执行
CREATE INDEX IF NOT EXISTS idx_users_github_url ON public.users (github_url);

COMMIT;

-- 附注：如需为 users 表开启 RLS 与策略，请在后续迁移中维护，避免覆盖现有策略
-- 参考：Supabase 迁移与 RLS 文档 https://supabase.com/docs/guides/database