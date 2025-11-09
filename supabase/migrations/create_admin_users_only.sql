-- 仅创建 admin_users 表与必要策略/索引
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'admin_users' AND policyname = '管理员可以查看所有管理员用户'
  ) THEN
    EXECUTE 'CREATE POLICY "管理员可以查看所有管理员用户" ON admin_users FOR SELECT TO authenticated USING (true)';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'admin_users' AND policyname = '超级管理员可以管理所有管理员'
  ) THEN
    EXECUTE 'CREATE POLICY "超级管理员可以管理所有管理员" ON admin_users FOR ALL TO authenticated USING (auth.uid() IN (SELECT id FROM admin_users WHERE role = ''super_admin''))';
  END IF;
END $$;