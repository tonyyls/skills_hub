-- 创建用户收藏表
CREATE TABLE user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 确保每个用户对每个技能只能收藏一次
  UNIQUE(user_id, skill_id)
);

-- 创建索引提高查询性能
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_skill_id ON user_favorites(skill_id);
CREATE INDEX idx_user_favorites_created_at ON user_favorites(created_at);

-- 启用行级安全
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看自己的收藏
CREATE POLICY "用户只能查看自己的收藏" ON user_favorites
  FOR SELECT USING (auth.uid() = user_id);

-- 创建策略：用户只能插入自己的收藏
CREATE POLICY "用户只能插入自己的收藏" ON user_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 创建策略：用户只能删除自己的收藏
CREATE POLICY "用户只能删除自己的收藏" ON user_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- 授予权限
GRANT ALL ON user_favorites TO authenticated;
GRANT SELECT ON user_favorites TO anon;