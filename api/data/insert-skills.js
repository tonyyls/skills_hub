import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少 Supabase 配置');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 读取生成的技能数据
const skillsDataPath = path.join(__dirname, 'skills.dev.json');

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
    const { error: deleteError } = await supabase.from('skills').delete().neq('id', '');
    if (deleteError) {
      console.error('❌ 清空数据失败:', deleteError.message);
      process.exit(1);
    }
    console.log('✅ 已清空现有技能数据');
    
    // 批量插入技能数据
    console.log('💾 开始插入技能数据...');
    let insertedCount = 0;
    const batchSize = 10; // 每批插入10条数据
    
    for (let i = 0; i < skillsData.length; i += batchSize) {
      const batch = skillsData.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('skills')
        .insert(batch);
      
      if (error) {
        console.error(`❌ 第 ${Math.floor(i/batchSize) + 1} 批数据插入失败:`, error.message);
        console.error('失败的数据:', batch.map(s => ({ id: s.id, title: s.title })));
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
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ 验证失败:', countError.message);
    } else {
      console.log(`📈 数据库中现有 ${count} 条技能数据`);
    }
    
  } catch (error) {
    console.error('❌ 插入过程出错:', error.message);
    process.exit(1);
  }
}

// 运行脚本
insertSkills().catch(error => {
  console.error('❌ 脚本执行失败:', error);
  process.exit(1);
});