import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../../.env') });

// 从 .env 加载，同时支持回退到非 VITE_ 前缀变量
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少 Supabase 配置');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 读取生成的技能数据；支持 --file 参数
const args = process.argv.slice(2);
const fileArgIndex = args.indexOf('--file');
const skillsDataPath = fileArgIndex !== -1
  ? (path.isAbsolute(args[fileArgIndex + 1]) ? args[fileArgIndex + 1] : path.join(process.cwd(), args[fileArgIndex + 1]))
  : path.join(__dirname, 'skills.dev.json');

/**
 * 将开发环境技能数据映射为数据库允许的字段，规避外键与约束：
 * - 去除不存在字段（如 recommended、source 等）
 * - 映射 status：active -> published；inactive -> draft；其余保持
 * - 置空 category_id 与 author_id（避免 UUID 外键约束）
 * - 省略 id 使用数据库默认 UUID
 */
/**
 * 将 dev 技能数据映射为当前数据库表 public.skills 的字段：
 * public.skills 列：id(uuid,默认)、name(text,必填)、category_id(uuid,可空)、author_id(uuid,必填,FK auth.users)、
 * description(text,可空)、logo_url(text,可空)、repo_url(text,可空)、featured(bool,默认false)、created_at/updated_at(timestamptz)
 */
function mapToDbSkill(dev, authorId) {
  return {
    name: dev.title,
    description: dev.description ?? null,
    category_id: null, // 分类暂不映射为数据库 UUID
    author_id: authorId,
    logo_url: null,
    repo_url: dev.git_url ?? null,
    featured: !!dev.featured,
    created_at: dev.created_at ?? new Date().toISOString(),
    updated_at: dev.updated_at ?? new Date().toISOString()
  };
}

/**
 * 获取或创建一个作者用户（auth.users），返回其 UUID。
 * 使用 service role key 访问管理接口。
 */
async function getOrCreateAuthorUser() {
  // 优先选择现有用户
  const list = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
  if (list?.data?.users?.length) {
    return list.data.users[0].id;
  }
  // 若无用户，创建一个种子用户
  const created = await supabase.auth.admin.createUser({
    email: 'seed@example.com',
    password: 'Seed12345!',
    email_confirm: true
  });
  if (created.error) {
    throw new Error(`创建作者用户失败: ${created.error.message}`);
  }
  return created.data.user?.id;
}

async function insertSkills() {
  try {
    console.log('📖 读取技能数据...');
    
    if (!fs.existsSync(skillsDataPath)) {
      console.error('❌ 技能数据文件不存在:', skillsDataPath);
      process.exit(1);
    }
    
    const skillsData = JSON.parse(fs.readFileSync(skillsDataPath, 'utf8'));
    console.log(`📊 读取到 ${skillsData.length} 条技能数据`);
    
    // 检查数据库连接
    console.log('🔌 测试数据库连接...');
    const { error: testError } = await supabase.from('skills').select('id').limit(1);
    if (testError) {
      console.error('❌ 数据库连接失败:', testError.message);
      process.exit(1);
    }
    
    console.log('✅ 数据库连接正常');
    
    // 清空现有技能数据（可选）
    console.log('🗑️ 清空现有技能数据...');
    // 使用 not('id','is',null) 避免 UUID 类型转换错误，删除所有非空 id 的记录
    const { error: deleteError } = await supabase.from('skills').delete().not('id', 'is', null);
    if (deleteError) {
      console.error('❌ 清空数据失败:', deleteError.message);
      process.exit(1);
    }
    console.log('✅ 已清空现有技能数据');
    
    // 获取作者用户ID
    console.log('👤 获取作者用户...');
    const authorId = await getOrCreateAuthorUser();
    if (!authorId) {
      console.error('❌ 无法获取作者用户ID');
      process.exit(1);
    }

    // 批量插入技能数据（映射到当前表结构）
    console.log('💾 开始插入技能数据...');
    let insertedCount = 0;
    const batchSize = 10; // 每批插入10条数据
    
    for (let i = 0; i < skillsData.length; i += batchSize) {
      const batch = skillsData.slice(i, i + batchSize).map(dev => mapToDbSkill(dev, authorId));
      
      const { data, error } = await supabase
        .from('skills')
        .insert(batch);
      
      if (error) {
        console.error(`❌ 第 ${Math.floor(i/batchSize) + 1} 批数据插入失败:`, error.message);
        console.error('失败的数据:', skillsData.slice(i, i + batchSize).map(s => ({ id: s.id, title: s.title })));
        continue;
      }
      
      insertedCount += batch.length;
      console.log(`✅ 已插入 ${insertedCount}/${skillsData.length} 条数据`);
      
      // 短暂延迟避免数据库压力过大
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`🎉 技能数据插入完成！总计插入 ${insertedCount} 条数据`);
    
    // 验证插入结果
    console.log('🔍 验证插入结果...');
    const { count, error: countError } = await supabase
      .from('skills')
      .select('id', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ 验证失败:', countError.message);
    } else {
      console.log(`📈 数据库中现有 ${count} 条技能数据`);
    }
    
  } catch (error) {
    console.error('❌ 插入过程出错:', error?.message || error);
    process.exit(1);
  }
}

// 运行脚本
insertSkills().catch(error => {
  console.error('❌ 脚本执行失败:', error);
  process.exit(1);
});