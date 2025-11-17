## 目标
- 将已完成的采集脚本与相关改动提交到 Git，不包含临时与生成文件。

## 提交内容
- `api/data/collect-github-scientific-skills.ts`：新增并参数化的 GitHub Skills 采集脚本
  - 支持 `--owner --repo --root --author --install --exclude --md --local --dry-run`
  - 支持本地路径稳定采集、README 回退、递归子目录识别
- `.gitignore`：新增 `tmp/` 忽略规则，确保本地克隆目录不提交

## 排除项
- 临时目录：`tmp/`（已忽略）
- 生成文件：`api/data/github-scientific-skills.jsonl`（不提交）
- 环境文件：`.env`（已忽略）

## 提交步骤
1. 预览改动
```bash
git status
```
2. 分组暂存
```bash
# 暂存代码改动
git add api/data/collect-github-scientific-skills.ts .gitignore
```
3. 提交信息（遵循 Conventional Commits）
```bash
git commit -m "feat(data): add parameterized GitHub skills collector with local mode and README fallback"
```
4. 可选打标签（如需版本标识）
```bash
git tag -a v0.1.0 -m "Initial skills collectors and local clone support"
```
5. 推送到远端（如需）
```bash
git push origin HEAD
# 如创建了标签
git push origin v0.1.0
```

## 验证
- 确认 `.gitignore` 生效：`git status --ignored -s` 出现 `!! tmp/`
- 确认未包含生成数据文件与环境文件

## 回滚方案
```bash
# 回退最近一次提交（保留工作区改动）
git reset --soft HEAD~1
# 或直接撤销提交（丢弃工作区改动）
git reset --hard HEAD~1
```

## 注意
- 不提交任何密钥或令牌；确保 `GITHUB_TOKEN` 仅在环境中使用。
- 后续如需继续迭代采集器（分类推断、UPSERT 优化、退避重试），在新分支进行增量提交。