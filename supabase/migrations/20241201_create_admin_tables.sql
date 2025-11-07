-- 创建管理员用户表
CREATE TABLE admin_users (
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

-- 创建技能分类表
CREATE TABLE skill_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  description TEXT,
  description_en TEXT,
  slug VARCHAR(100) UNIQUE NOT NULL,
  parent_id UUID REFERENCES skill_categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建技能表（扩展版本）
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  title_en VARCHAR(200),
  description TEXT,
  description_en TEXT,
  content TEXT NOT NULL,
  content_en TEXT,
  category_id UUID REFERENCES skill_categories(id),
  difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_time INTEGER, -- 预计学习时间（分钟）
  tags TEXT[], -- PostgreSQL数组类型
  prerequisites TEXT[],
  author_id UUID REFERENCES admin_users(id),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- 创建管理员操作日志表
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admin_users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建默认管理员账号（用户名：admin，密码：admin123）
INSERT INTO admin_users (username, email, password_hash, role, is_active) VALUES 
('admin', 'admin@skills-hub.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin', true);

-- 创建索引
CREATE INDEX idx_admin_users_username ON admin_users(username);
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_skill_categories_slug ON skill_categories(slug);
CREATE INDEX idx_skill_categories_parent ON skill_categories(parent_id);
CREATE INDEX idx_skills_category ON skills(category_id);
CREATE INDEX idx_skills_status ON skills(status);
CREATE INDEX idx_skills_featured ON skills(featured);
CREATE INDEX idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_created ON admin_logs(created_at);

-- 设置权限
GRANT ALL PRIVILEGES ON admin_users TO authenticated;
GRANT ALL PRIVILEGES ON skill_categories TO authenticated;
GRANT ALL PRIVILEGES ON skills TO authenticated;
GRANT ALL PRIVILEGES ON admin_logs TO authenticated;

-- 启用行级安全
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "管理员可以查看所有管理员用户" ON admin_users FOR SELECT TO authenticated USING (true);
CREATE POLICY "超级管理员可以管理所有管理员" ON admin_users FOR ALL TO authenticated USING (auth.uid() IN (SELECT id FROM admin_users WHERE role = 'super_admin'));

CREATE POLICY "所有认证用户可以查看分类" ON skill_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "管理员可以管理分类" ON skill_categories FOR ALL TO authenticated USING (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "所有用户可以查看已发布的技能" ON skills FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "所有认证用户可以查看所有技能" ON skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "管理员可以管理技能" ON skills FOR ALL TO authenticated USING (auth.uid() IN (SELECT id FROM admin_users));