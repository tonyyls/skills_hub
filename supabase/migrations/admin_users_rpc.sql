-- 管理员用户 RPC：创建与更新密码
-- 依赖：pgcrypto（gen_salt/crypt）已启用

-- 创建管理员用户（安全地哈希密码）
CREATE OR REPLACE FUNCTION create_admin_user(
  p_username TEXT,
  p_email TEXT,
  p_password TEXT,
  p_role TEXT DEFAULT 'admin',
  p_is_active BOOLEAN DEFAULT TRUE
) RETURNS admin_users AS $$
DECLARE
  v_hash TEXT;
  v_row admin_users;
BEGIN
  IF p_username IS NULL OR p_email IS NULL OR p_password IS NULL THEN
    RAISE EXCEPTION '缺少必填字段';
  END IF;
  IF p_role NOT IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION '非法角色: %', p_role;
  END IF;

  v_hash := crypt(p_password, gen_salt('bf'));

  INSERT INTO admin_users (username, email, password_hash, role, is_active)
  VALUES (p_username, p_email, v_hash, COALESCE(p_role, 'admin'), COALESCE(p_is_active, TRUE))
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

-- 更新管理员密码（安全地哈希）
CREATE OR REPLACE FUNCTION update_admin_user_password(
  p_id UUID,
  p_password TEXT
) RETURNS VOID AS $$
DECLARE
  v_hash TEXT;
BEGIN
  IF p_id IS NULL OR p_password IS NULL THEN
    RAISE EXCEPTION '缺少必填字段';
  END IF;

  v_hash := crypt(p_password, gen_salt('bf'));
  UPDATE admin_users SET password_hash = v_hash, updated_at = NOW() WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;