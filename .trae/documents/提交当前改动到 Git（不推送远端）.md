## 提交内容
- index.html：接入 Vercel Web Analytics 免费脚本
- src/pages/HomePage.vue：头部三栏布局（左/中/右），分段控件居中；Tab 文本与图标水平对齐；消除切换闪动
- src/pages/SkillDetailPage.vue：加载态骨架屏，背景统一为浅米色，与整站一致
- api/data/collect-github-scientific-skills.ts：参数化采集器与本地模式（此前改动）
- .gitignore：忽略 tmp/

## 提交策略
- 仅提交上述代码文件；不提交 .env、临时目录 tmp/、生成数据文件 api/data/github-scientific-skills.jsonl
- 使用单一规范化提交信息（Conventional Commits）

## 执行命令
```bash
# 预览变更
git status

# 精准暂存改动文件
git add index.html src/pages/HomePage.vue src/pages/SkillDetailPage.vue api/data/collect-github-scientific-skills.ts .gitignore

# 提交
git commit -m "feat: add Vercel Web Analytics; fix(home): tabs UI alignment & flicker; style(detail): skeleton loading; chore(data): param collector; chore: ignore tmp/"

# 可选推送（本次不推）
# git push origin HEAD
```

## 验证
- 确认提交仅包含上述文件；`.env`、`tmp/`、`*.jsonl` 未包含
- 保留后续推送由你来执行或我再协助