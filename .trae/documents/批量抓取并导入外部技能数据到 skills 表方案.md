## 执行目标与范围
- 从 `https://skills.pub/api/skills` 全量抓取 `total=311` 条数据，分页 `pageSize=16`，循环至最后一页。
- 映射字段严格按你的要求：不映射 `category_id`、`published_at`、`tags`、`content`；`status` 默认 `published`。
- 遇到单条异常则跳过，记录 `skillId` 以便后续追踪与幂等去重。

## 字段映射与默认值
- `name` → `skillName`
- `description` → `pluginDescription`（`trim`，空置 `null`）
- `author_name` → `author.name`（`trim` 后截断 ≤ 50 字符；空置 `null`）
- `git_url` → `repositoryUrl`（去反引号与空白，仅 `https://` 合法 URL；非法置 `null`）
- `install_command` → `pluginBin`（`trim`，限制长度与字符集；非法置 `null`）
- `status` → 固定 `published`
- 不写入：`category_id`、`published_at`、`tags`、`content`

## 幂等与去重策略
- 判断顺序：
  1. `git_url` 完全匹配（首选）
  2. `skillId` 完全匹配（次选，作为外部标识；不作为主键）
  3. `title + author_name`（兜底）
- 命中则 `PUT /api/admin/skills/:id` 更新差异字段；未命中则 `POST /api/admin/skills` 新增。
- 指纹：`sha1(normalize(repositoryUrl) + '|' + (skillId||'') + '|' + skillName)`，用于日志与断点续传。

## 抓取与速率控制
- 分页：首次探测 `data.total`，计算总页；迭代 `page=1..totalPages`。
- 并发：2–4 并发页，页间 `200–400ms` 延迟。
- 重试：网络错误/5xx/429 指数退避（500ms→1s→2s→4s），最多 3 次；超出则记失败并继续。

## 写入路径与鉴权（推荐）
- 使用内部管理员 API：
  - 登录：`POST /api/admin/login` 获取 `admin_token`
  - 新增：`POST /api/admin/skills`
  - 更新：`PUT /api/admin/skills/:id`
- 优点：安全、与现有校验一致；无需暴露数据库密钥。

## 错误处理与跳过
- 单条异常：捕获后写日志（含 `skillId` 与原因），直接跳过，不中断全局任务。
- 异常类型：无效 URL、命令不合规、写入接口非 2xx、网络/超时、JSON 结构异常。

## 日志与断点续传
- 条目日志：`skillId`、`title`、`result=created|updated|failed`、原因、指纹。
- 汇总统计：成功、更新、失败计数；记录最后完成页码。
- 断点文件：持久化指纹集合与页码，可从最近断点恢复。

## 伪代码（仅示意）
```ts
/**
 * 全量导入：仅映射必需字段，status=published，异常跳过并记录 skillId。
 */
async function importAll(): Promise<void> {
  const BASE = 'https://skills.pub/api/skills'
  const PAGE_SIZE = 16
  const token = await loginAdmin()
  const total = await probeTotal(BASE, PAGE_SIZE)
  const totalPages = Math.ceil(total / PAGE_SIZE)

  for (let page = 1; page <= totalPages; page++) {
    const { skills } = await fetchPage(BASE, page, PAGE_SIZE)
    for (const s of skills) {
      const mapped = mapFields(s)
      try {
        const existing = await findExisting(mapped, s, token)
        if (existing) {
          await updateSkill(existing.id, mapped, token)
          logEntry(s, mapped, 'updated')
        } else {
          await createSkill(mapped, token)
          logEntry(s, mapped, 'created')
        }
      } catch (e) {
        logEntry(s, mapped, 'failed', String(e))
        continue
      }
    }
    await sleep(300)
  }
}
```

## 运行与交付
- 运行脚本位置：`api/data/import-external-skills.ts`
- 执行：开发环境 `pnpm tsx api/data/import-external-skills.ts`；也可部署为定时任务（Vercel Cron）。
- 交付：
  - 可重复执行的导入脚本（支持断点续传）
  - 导入日志（含每条 `skillId` 与结果）
  - 汇总统计（新增/更新/失败）

## 风险与防护
- 外部结构变化：对 `data.skills` 结构做防御性解析；异常列跳过。
- URL/命令安全：严格校验并置 `null`；避免注入风险。
- 速率限制：指数退避防止封禁。

---
确认后我将开始实现并全量执行导入（不进行额外测试环节），执行中每页输出统计与最终汇总。