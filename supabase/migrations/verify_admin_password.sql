-- 管理员登录密码校验 RPC（bcrypt via pgcrypto）
-- 使用数据库端的 `crypt()` 与存储的 `password_hash` 比较，返回布尔值。

CREATE OR REPLACE FUNCTION verify_admin_user_password(
  p_id UUID,
  p_password TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_hash TEXT;
BEGIN
  IF p_id IS NULL OR p_password IS NULL THEN
    RAISE EXCEPTION '缺少必填字段';
  END IF;

  SELECT password_hash INTO v_hash FROM admin_users WHERE id = p_id;
  IF v_hash IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN crypt(p_password, v_hash) = v_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;