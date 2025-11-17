## 目标
- 以 GitHub Contents API 采集 `scientific-skills/` 下全部技能，产出结构化数据：`name`、`authorName`、`rootDir`、`description`、`content`、`status`、`gitUrl`。 
- 映射到现有数据库字段并做 UPSERT，不创建新表。

## 数据源
- 仓库：`https://github.com/K-Dense-AI/claude-scientific-skills`
- 技能根目录：`scientific-skills/`

## 接口与依赖
- GitHub Contents API：`GET /repos/{owner}/{repo}/contents/{path}`
- 可选依赖：`js-yaml`（解析 YAML front matter）、`p-limit`（并发控制）
- 环境变量：`GITHUB_TOKEN`（可选提升速率与权限）

## 字段规则
- `name`=子目录名
- `authorName`=`K-Dense-AI`
- `rootDir`=`scientific-skills`
- `description`：优先解析 `SKILL.md` 的 YAML front matter 或行内 `description:`；无则取正文首段
- `content`：完整 `SKILL.md` 文本
- `status`=`draft`
- `gitUrl`=`https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/scientific-skills/<skillDir>`

## 数据库字段映射
- 使用现有表，不创建新表；按以下字段进行 UPSERT：
- `name`→`name`，`authorName`→`author_name`，`rootDir`→`root_dir`，`description`→`description`，`content`→`content`，`status`→`status`，`gitUrl`→`git_url`
- 扩展字段：`sourceRepo`→`source_repo`，`skillDir`→`skill_dir`，`descriptionSource`→`description_source`，`missingSkillMd`→`missing_skill_md`，`contentSha1`→`content_sha1`，`createdAt`→`created_at`，`updatedAt`→`updated_at`
- 业务唯一键建议：`author_name + root_dir + name`

## 执行流程
1. 列目录：调用 `GET /repos/K-Dense-AI/claude-scientific-skills/contents/scientific-skills`，取 `type=dir` 的子项
2. 并发读取 `SKILL.md`：对每个子目录读取 `scientific-skills/<dir>/SKILL.md` 并 base64 解码
3. 解析 `description`：优先 YAML front matter 或行内 `description:`；无则回退正文首段（约 200 字）
4. 生成记录：补齐字段、计算 `contentSha1`、标记 `descriptionSource`/`missingSkillMd`
5. 输出：生成 JSONL 文件或流式推送到现有入库服务
6. 入库：以唯一键 UPSERT 更新 `description`、`content`、`status`、`gitUrl`、`contentSha1`、时间戳

## 并发与速率控制
- 并发 5–10；遇到 403 速率限制采用指数退避重试
- 若使用 `GITHUB_TOKEN`，在 `Authorization: Bearer` 头中附带

## 异常处理
- 缺失 `SKILL.md`：`missingSkillMd=true`，记录并跳过或占位
- 内容异常：保留原文，避免破坏 Markdown；链接不可用记录并继续

## 验证与交付
- 抽样 ≥10 条核验：`gitUrl` 可打开、`content` 完整、`description` 合理
- 交付产出：JSONL 文件与采集日志，供现有入库服务消费

## 输出示例（JSON 行）
```json
{
  "name": "pubmed",
  "authorName": "K-Dense-AI",
  "rootDir": "scientific-skills",
  "description": "通过 API 访问 PubMed 并进行文献检索与摘要生成。",
  "content": "# Skill: PubMed\n...",
  "status": "draft",
  "gitUrl": "https://github.com/K-Dense-AI/claude-scientific-skills/tree/main/scientific-skills/pubmed",
  "sourceRepo": "https://github.com/K-Dense-AI/claude-scientific-skills",
  "skillDir": "pubmed",
  "descriptionSource": "metadata",
  "missingSkillMd": false,
  "contentSha1": "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3",
  "createdAt": "2025-11-16T00:00:00Z",
  "updatedAt": "2025-11-16T00:00:00Z"
}
```

## 参考实现（TypeScript 示意，不执行）
```ts
import { readFile } from 'node:fs/promises'
import crypto from 'node:crypto'
import yaml from 'js-yaml'

const owner = 'K-Dense-AI'
const repo = 'claude-scientific-skills'
const rootDir = 'scientific-skills'
const token = process.env.GITHUB_TOKEN

async function gh(url: string) {
  const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
  if (!res.ok) throw new Error(`GitHub ${res.status}`)
  return res.json()
}

function sha1(s: string) {
  return crypto.createHash('sha1').update(s).digest('hex')
}

function parseDescription(md: string) {
  const fm = md.match(/^---\n([\s\S]*?)\n---\n/)
  if (fm) {
    const meta = yaml.load(fm[1]) as any
    if (meta && typeof meta.description === 'string') return { description: meta.description, source: 'metadata' }
  }
  const body = md.replace(/^---[\s\S]*?---\n/, '')
  const first = body.split(/\n\n+/).find(t => !t.trim().startsWith('#')) || ''
  return { description: first.trim().slice(0, 200), source: 'fallback' }
}

async function listSkills() {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${rootDir}`
  const items = await gh(url)
  return items.filter((i: any) => i.type === 'dir').map((i: any) => i.name)
}

async function readSkillMd(dir: string) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${rootDir}/${dir}/SKILL.md`
  const data = await gh(url)
  const content = Buffer.from(data.content, 'base64').toString('utf8')
  return content
}

async function run() {
  const dirs = await listSkills()
  const records = []
  for (const d of dirs) {
    try {
      const md = await readSkillMd(d)
      const { description, source } = parseDescription(md)
      const gitUrl = `https://github.com/${owner}/${repo}/tree/main/${rootDir}/${d}`
      records.push({
        name: d,
        authorName: owner,
        rootDir,
        description,
        content: md,
        status: 'draft',
        gitUrl,
        sourceRepo: `https://github.com/${owner}/${repo}`,
        skillDir: d,
        descriptionSource: source,
        missingSkillMd: false,
        contentSha1: sha1(md)
      })
    } catch (e) {
      records.push({
        name: d,
        authorName: owner,
        rootDir,
        description: '',
        content: '',
        status: 'draft',
        gitUrl: `https://github.com/${owner}/${repo}/tree/main/${rootDir}/${d}`,
        sourceRepo: `https://github.com/${owner}/${repo}`,
        skillDir: d,
        descriptionSource: 'fallback',
        missingSkillMd: true,
        contentSha1: ''
      })
    }
  }
  return records
}

run().then(r => {
  console.log(JSON.stringify(r, null, 2))
})
```

## 验证
- 抽样检查 10 条数据链接与内容完整性
- 对比 `contentSha1` 做增量更新验证

## 交付
- 提供 JSONL 数据与采集日志
- 与现有入库服务对接，执行 UPSERT，不创建新表