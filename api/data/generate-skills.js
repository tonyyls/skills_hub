import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 技能模板数据
const skillTemplates = [
  {
    category: '前端开发',
    templates: [
      { title: 'React Hooks 最佳实践', difficulty: 'intermediate', tags: ['React', 'JavaScript', 'Hooks'] },
      { title: 'Vue 3 Composition API 实战', difficulty: 'intermediate', tags: ['Vue', 'JavaScript', 'Composition API'] },
      { title: 'TypeScript 高级类型系统', difficulty: 'advanced', tags: ['TypeScript', 'JavaScript', '类型系统'] },
      { title: 'CSS Grid 布局完全指南', difficulty: 'beginner', tags: ['CSS', '布局', 'Grid'] },
      { title: 'Webpack 5 配置优化', difficulty: 'advanced', tags: ['Webpack', '构建工具', '性能优化'] },
      { title: 'ESLint 代码规范配置', difficulty: 'beginner', tags: ['ESLint', '代码规范', 'JavaScript'] },
      { title: 'Jest 单元测试实战', difficulty: 'intermediate', tags: ['Jest', '测试', 'JavaScript'] },
      { title: 'Svelte 响应式编程', difficulty: 'intermediate', tags: ['Svelte', 'JavaScript', '响应式'] },
      { title: 'Next.js SSR 服务端渲染', difficulty: 'advanced', tags: ['Next.js', 'React', 'SSR'] },
      { title: 'Tailwind CSS 实用工具库', difficulty: 'beginner', tags: ['Tailwind', 'CSS', '工具库'] }
    ]
  },
  {
    category: '后端开发',
    templates: [
      { title: 'Node.js Express 框架实战', difficulty: 'intermediate', tags: ['Node.js', 'Express', '后端'] },
      { title: 'Python FastAPI 高性能API', difficulty: 'intermediate', tags: ['Python', 'FastAPI', 'API'] },
      { title: 'Go Gin Web 框架入门', difficulty: 'beginner', tags: ['Go', 'Gin', 'Web框架'] },
      { title: 'Java Spring Boot 微服务', difficulty: 'advanced', tags: ['Java', 'Spring Boot', '微服务'] },
      { title: 'Ruby on Rails 快速开发', difficulty: 'intermediate', tags: ['Ruby', 'Rails', 'Web开发'] },
      { title: 'GraphQL API 设计与实现', difficulty: 'advanced', tags: ['GraphQL', 'API', '数据库'] },
      { title: 'RESTful API 设计最佳实践', difficulty: 'intermediate', tags: ['REST', 'API', '设计'] },
      { title: 'Docker 容器化部署', difficulty: 'intermediate', tags: ['Docker', '容器', '部署'] },
      { title: 'Kubernetes 集群管理', difficulty: 'advanced', tags: ['Kubernetes', '容器编排', '集群'] },
      { title: 'Nginx 反向代理配置', difficulty: 'intermediate', tags: ['Nginx', '反向代理', '服务器'] }
    ]
  },
  {
    category: '数据库',
    templates: [
      { title: 'PostgreSQL 高级查询优化', difficulty: 'advanced', tags: ['PostgreSQL', 'SQL', '性能优化'] },
      { title: 'MongoDB 文档数据库实战', difficulty: 'intermediate', tags: ['MongoDB', 'NoSQL', '文档数据库'] },
      { title: 'Redis 缓存策略设计', difficulty: 'intermediate', tags: ['Redis', '缓存', '性能'] },
      { title: 'MySQL 索引优化指南', difficulty: 'advanced', tags: ['MySQL', '索引', '性能'] },
      { title: 'Elasticsearch 搜索引擎', difficulty: 'advanced', tags: ['Elasticsearch', '搜索', '数据分析'] },
      { title: 'SQLite 轻量级数据库', difficulty: 'beginner', tags: ['SQLite', '数据库', '轻量级'] },
      { title: '数据库事务与并发控制', difficulty: 'advanced', tags: ['数据库', '事务', '并发'] },
      { title: '数据库设计范式与反范式', difficulty: 'intermediate', tags: ['数据库设计', '范式', '建模'] }
    ]
  },
  {
    category: 'AI与机器学习',
    templates: [
      { title: 'TensorFlow 深度学习入门', difficulty: 'intermediate', tags: ['TensorFlow', '深度学习', 'Python'] },
      { title: 'PyTorch 神经网络实战', difficulty: 'intermediate', tags: ['PyTorch', '神经网络', 'Python'] },
      { title: 'Scikit-learn 机器学习算法', difficulty: 'beginner', tags: ['Scikit-learn', '机器学习', 'Python'] },
      { title: '自然语言处理基础', difficulty: 'intermediate', tags: ['NLP', '自然语言处理', 'AI'] },
      { title: '计算机视觉与OpenCV', difficulty: 'intermediate', tags: ['计算机视觉', 'OpenCV', 'Python'] },
      { title: '深度学习模型部署优化', difficulty: 'advanced', tags: ['深度学习', '模型部署', '优化'] }
    ]
  },
  {
    category: 'DevOps',
    templates: [
      { title: 'CI/CD Jenkins 自动化部署', difficulty: 'intermediate', tags: ['Jenkins', 'CI/CD', '自动化'] },
      { title: 'GitLab DevOps 实践指南', difficulty: 'intermediate', tags: ['GitLab', 'DevOps', 'CI/CD'] },
      { title: 'Ansible 自动化运维', difficulty: 'intermediate', tags: ['Ansible', '自动化', '运维'] },
      { title: 'Prometheus 监控告警系统', difficulty: 'advanced', tags: ['Prometheus', '监控', '告警'] },
      { title: 'Terraform 基础设施即代码', difficulty: 'advanced', tags: ['Terraform', 'IaC', '基础设施'] },
      { title: 'Linux 系统性能调优', difficulty: 'advanced', tags: ['Linux', '性能调优', '系统'] }
    ]
  }
];

// 使用现有 demo 分类ID（见 api/data/categories.dev.json）
const demoCategoryIds = [
  'demo-001','demo-002','demo-003','demo-004','demo-005','demo-006','demo-007',
  'demo-008','demo-009','demo-010','demo-011','demo-012','demo-013'
];

// 生成随机数据函数
function generateRandomData() {
  const viewCount = Math.floor(Math.random() * 5000) + 100;
  const likeCount = Math.floor(viewCount * 0.1) + Math.floor(Math.random() * 50);
  const status = Math.random() > 0.3 ? 'active' : 'inactive';
  const featured = Math.random() > 0.7;
  const recommended = Math.random() > 0.6;
  
  const sources = ['community', 'official', 'tutorial'];
  const source = sources[Math.floor(Math.random() * sources.length)];
  
  const gitUrls = [
    'https://github.com/example/react-hooks-best-practices',
    'https://github.com/example/vue3-composition-api',
    'https://github.com/example/typescript-advanced-types',
    'https://github.com/example/css-grid-guide',
    'https://github.com/example/webpack5-optimization'
  ];
  const gitUrl = gitUrls[Math.floor(Math.random() * gitUrls.length)];
  
  const installCommands = [
    'npm install react-hooks-best-practices',
    'yarn add vue-composition-api',
    'npm install -D typescript-types',
    'npm install css-grid-utilities',
    'npm install webpack-optimizer'
  ];
  const installCommand = installCommands[Math.floor(Math.random() * installCommands.length)];
  
  return {
    viewCount,
    likeCount,
    status,
    featured,
    recommended,
    source,
    gitUrl,
    installCommand
  };
}

// 生成技能描述和内容
function generateSkillContent(title, difficulty) {
  const difficultyDescriptions = {
    beginner: '适合初学者的入门教程，循序渐进的学习路径',
    intermediate: '中级进阶内容，需要一定的基础知识',
    advanced: '高级技术深入解析，适合有经验的开发者'
  };
  
  const description = `${title} - ${difficultyDescriptions[difficulty]}`;
  
  const content = `# ${title}

## 概述
${description}，帮助开发者掌握核心概念和实用技能。

## 主要内容
- 基础概念和原理
- 实际应用场景
- 最佳实践建议
- 常见问题解答

## 学习目标
完成本技能学习后，您将能够：
- 理解${title}的核心概念
- 在实际项目中应用相关技术
- 解决常见的开发问题
- 提升代码质量和开发效率

## 适用人群
- ${difficulty === 'beginner' ? '编程初学者' : difficulty === 'intermediate' ? '有一定基础的开发者' : '经验丰富的开发者'}
- 希望学习${title}的技术人员
- 想要提升技能水平的开发者

## 前置要求
${difficulty === 'beginner' ? '无特殊要求' : difficulty === 'intermediate' ? '需要掌握基础的编程概念' : '需要具备相关技术的深入理解'}
`;

  return { description, content };
}

// 生成随机时间
function generateRandomTime() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 365);
  const hoursAgo = Math.floor(Math.random() * 24);
  const minutesAgo = Math.floor(Math.random() * 60);
  
  const time = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000) - (minutesAgo * 60 * 1000));
  return time.toISOString();
}

// 生成技能数据
function generateSkills() {
  const skills = [];
  let skillCounter = 1;
  
  for (const categoryData of skillTemplates) {
    for (const template of categoryData.templates) {
      const randomData = generateRandomData();
      const contentData = generateSkillContent(template.title, template.difficulty);
      const createdTime = generateRandomTime();
      const updatedTime = generateRandomTime();
      // 轮询分配 demo 分类ID
      const categoryId = demoCategoryIds[(skillCounter - 1) % demoCategoryIds.length];
      
      const skill = {
        id: `skill-${String(skillCounter).padStart(3, '0')}`,
        title: template.title,
        description: contentData.description,
        content: contentData.content,
        category_id: categoryId,
        difficulty_level: template.difficulty,
        tags: template.tags,
        status: randomData.status,
        view_count: randomData.viewCount,
        like_count: randomData.likeCount,
        featured: randomData.featured,
        recommended: randomData.recommended,
        source: randomData.source,
        git_url: randomData.gitUrl,
        install_command: randomData.installCommand,
        created_at: createdTime,
        updated_at: updatedTime,
        published_at: randomData.status === 'active' ? createdTime : null
      };
      
      skills.push(skill);
      skillCounter++;
      
      // 如果还需要更多技能，创建变体
      if (skillCounter <= 50) {
        // 创建变体
        const variants = [
          { suffix: '进阶版', prefix: '深入理解' },
          { suffix: '实战教程', prefix: '手把手教你' },
          { suffix: '完全指南', prefix: '全面掌握' },
          { suffix: '最佳实践', prefix: '企业级' }
        ];
        
        const variant = variants[Math.floor(Math.random() * variants.length)];
        const newTitle = `${variant.prefix}${template.title}${variant.suffix}`;
        
        const variantData = generateRandomData();
        const variantContent = generateSkillContent(newTitle, template.difficulty);
        const variantCreatedTime = generateRandomTime();
        const variantUpdatedTime = generateRandomTime();
        
        const variantSkill = {
          id: `skill-${String(skillCounter).padStart(3, '0')}`,
          title: newTitle,
          description: variantContent.description,
          content: variantContent.content,
          category_id: demoCategoryIds[(skillCounter - 1) % demoCategoryIds.length],
          difficulty_level: template.difficulty,
          tags: [...template.tags, variant.suffix.replace('版', '')],
          status: variantData.status,
          view_count: variantData.viewCount,
          like_count: variantData.likeCount,
          featured: variantData.featured,
          recommended: variantData.recommended,
          source: variantData.source,
          git_url: variantData.gitUrl,
          install_command: variantData.installCommand,
          created_at: variantCreatedTime,
          updated_at: variantUpdatedTime,
          published_at: variantData.status === 'active' ? variantCreatedTime : null
        };
        
        skills.push(variantSkill);
        skillCounter++;
      }
      
      if (skillCounter > 50) break;
    }
    
    if (skillCounter > 50) break;
  }
  
  return skills.slice(0, 50);
}

// 主函数
/**
 * 主执行函数：生成技能数据并写入文件。
 * 支持命令行参数：
 *  - --count <n> 生成数量，默认 20，最大 50（受模板限制）
 *  - --output <path> 输出文件路径，默认写入当前目录的 skills.dev.json
 */
function main() {
  // 解析 CLI 参数
  const args = process.argv.slice(2);
  const countArgIndex = args.indexOf('--count');
  const outputArgIndex = args.indexOf('--output');
  const requestedCount = countArgIndex !== -1 ? parseInt(args[countArgIndex + 1], 10) : 20;
  const outputPathArg = outputArgIndex !== -1 ? args[outputArgIndex + 1] : null;

  const count = Number.isFinite(requestedCount) && requestedCount > 0 ? Math.min(requestedCount, 50) : 20;
  console.log(`开始生成${count}条模拟技能数据...`);

  let skills = generateSkills();
  if (skills.length > count) {
    skills = skills.slice(0, count);
  }

  // 确保目录存在
  const dataDir = path.join(__dirname);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // 写入文件
  const outputPath = outputPathArg ? path.isAbsolute(outputPathArg) ? outputPathArg : path.join(process.cwd(), outputPathArg) : path.join(dataDir, 'skills.dev.json');
  fs.writeFileSync(outputPath, JSON.stringify(skills, null, 2));

  console.log(`✅ 成功生成 ${skills.length} 条技能数据`);
  console.log(`📁 文件已保存到: ${outputPath}`);

  // 统计信息
  const stats = {
    total: skills.length,
    byCategory: {},
    byDifficulty: {},
    byStatus: {},
    featured: skills.filter(s => s.featured).length,
    recommended: skills.filter(s => s.recommended).length
  };

  skills.forEach(skill => {
    const category = skillTemplates.find(cat => cat.templates.some(t =>
      skill.title.includes(t.title.split(' ')[0]) || t.title.includes(skill.title.split(' ')[0])
    ))?.category || '其他';

    stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
    stats.byDifficulty[skill.difficulty_level] = (stats.byDifficulty[skill.difficulty_level] || 0) + 1;
    stats.byStatus[skill.status] = (stats.byStatus[skill.status] || 0) + 1;
  });

  console.log('\n📊 数据统计:');
  console.log(`总计: ${stats.total} 条技能`);
  console.log('按分类:', stats.byCategory);
  console.log('按难度:', stats.byDifficulty);
  console.log('按状态:', stats.byStatus);
  console.log(`精选技能: ${stats.featured} 个`);
  console.log(`推荐技能: ${stats.recommended} 个`);
}

// 运行脚本
main();

export { generateSkills };