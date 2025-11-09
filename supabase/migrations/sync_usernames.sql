-- 同步数据一致性：将 public.users.username 同步到 user_profiles.username（仅在 user_profiles.username 为空时）
-- 目的：确保 /api/admin/users 接口中的用户名优先从 user_profiles 读取，但当其为空时，用 public.users 作为回填来源。

BEGIN;

-- 仅在 user_profiles.username 为空时进行同步写入
UPDATE public.user_profiles AS up
SET username = u.username,
    updated_at = NOW()
FROM public.users AS u
WHERE up.user_id = u.id
  AND (up.username IS NULL OR up.username = '')
  AND u.username IS NOT NULL
  AND u.username <> '';

COMMIT;

-- 可选：创建一个视图统一读取（若后续前端或其他服务需要）
-- CREATE OR REPLACE VIEW public.v_user_identity AS
-- SELECT
--   au.id AS auth_user_id,
--   COALESCE(up.username, u.username, au.email) AS username,
--   up.role,
--   up.is_active,
--   au.email,
--   au.created_at,
--   up.updated_at
-- FROM auth.users au
-- LEFT JOIN public.user_profiles up ON up.user_id = au.id
-- LEFT JOIN public.users u ON u.id = au.id;