## 页面结构
- 模块首页 `/doc-skills`
  - 头部介绍：标题、副标题、要点概述（多源抓取、代码解析、冲突检测、PDF OCR、AI增强、打包上传）。
  - 能力速览卡片：
    - 文档抓取：llms.txt 自动识别、通用爬取、智能分类
    - GitHub 深度解析：AST、API提取、Issues/PR/Releases、冲突检测
    - PDF 提取：OCR、表格解析、并行、密码支持
    - 多源合并：统一技能包、差异对比与报告
    - AI增强：本地增强、示例抽取与关键概念提炼
  - CTA：按钮“创建技能”，跳转 `/doc-skills/create`
  - 我的任务列表：状态、进度、创建时间、结果下载；空态提示与引导
- 创建页 `/doc-skills/create`
  - 数据源 Tabs：文档站点 / GitHub 仓库 / PDF 文件
  - 表单字段（映射 Skill Seeker 能力）：
    - 文档站点
      - `url`、`preset`（如 React/Godot/Vue/Django/FastAPI）
      - `useLlmsTxt`（自动 llms.txt，更快）
      - `enhanceLocal`（AI本地增强）
    - GitHub 仓库
      - `repo`（owner/name）、`branch`
      - `deepAst`（AST解析启用）、`includeIssues`、`includePRs`、`includeReleases`
      - `conflictDetect`（文档 vs 代码差异分析）
      - `enhanceLocal`
    - PDF 文件
      - `name`、`pdfUrl`（一期占位，后续改上传）
      - `ocr`、`extractTables`、`parallel`、`workers`
      - `enhanceLocal`
  - 通用选项
    - `asyncMode`、`cacheReuse`、`resumeCheckpoint`
    - 输出包名与分类：`skillName`、`category`
  - 提交后返回 `taskId`，跳转 `/doc-skills/tasks/:id`
- 任务详情页 `/doc-skills/tasks/:id`
  - 状态徽章：pending/running/succeeded/failed/canceled
  - 进度条：0–100
  - 日志查看：stdout/stderr 过滤、滚动加载、关键字高亮（llms.txt、AST、OCR、tables、conflict）
  - 结果区域：`.zip` 下载链接、产物清单（SKILL.md、references/）、冲突报告摘要（若有）
  - 操作：取消任务（占位）、重试（占位）

## 视觉与风格
- 统一使用 Tailwind 与站点现有组件/样式：
  - 页面容器 `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
  - 标题样式：`text-2xl font-semibold`、副标题 `text-muted-foreground`
  - 卡片：`rounded-xl border bg-card text-card-foreground shadow-sm`
  - 主按钮：`btn-primary`（复用站点按钮类）、次按钮 `btn-outline`
  - 徽章：状态颜色区分（成功/运行/失败）
- 文案与 i18n
  - `docSkills.home.title`、`docSkills.home.subtitle`
  - `docSkills.feature.docs`/`github`/`pdf`/`multiSource`/`enhance`
  - `docSkills.create.title`、`docSkills.task.title`

## 路由与守卫
- 新增
  - `/doc-skills`（meta.requiresAuth: true）
  - `/doc-skills/create`（meta.requiresAuth: true）
  - `/doc-skills/tasks/:id`（meta.requiresAuth: true）
- 顶部菜单新增“文档技能”，链接 `/doc-skills`；未登录由现有全局守卫拦截

## 接口契约（占位实现，不接入后端逻辑）
- `POST /api/doc-skills/tasks`
  - 入参示例
```json
{
  "sourceType": "docs|github|pdf",
  "sourceConfig": {
    "docs": {"url": "https://react.dev", "preset": "react", "useLlmsTxt": true},
    "github": {"repo": "facebook/react", "branch": "main", "deepAst": true, "includeIssues": true, "includePRs": true, "includeReleases": true, "conflictDetect": true},
    "pdf": {"name": "myskill", "pdfUrl": "https://example.com/manual.pdf", "ocr": true, "extractTables": true, "parallel": true, "workers": 8}
  },
  "options": {"enhanceLocal": true, "asyncMode": true, "cacheReuse": true, "resumeCheckpoint": true},
  "output": {"skillName": "react-skill", "category": "frontend"}
}
```
  - 出参：`{"taskId":"uuid"}`
- `GET /api/doc-skills/tasks/:id`
  - 出参：`{ id, status, progress, logs, resultUrl, createdAt }`
- `GET /api/doc-skills/tasks?createdBy=me&page=1&pageSize=20`
  - 出参：`{ items: TaskItem[], page, pageSize, total }`
- `POST /api/doc-skills/tasks/:id/cancel`
  - 出参：`{ ok: true }`

## 示例页面骨架
```vue
<!-- DocSkillsHomePage.vue（能力速览 + 空态 + 列表） -->
<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-6">
      <h1 class="text-2xl font-semibold">文档技能</h1>
      <p class="text-muted-foreground">自动将文档站、GitHub、PDF 转为可上传的 Claude 技能包</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      <div class="rounded-xl border bg-card shadow-sm p-4">
        <h2 class="font-medium">文档抓取</h2>
        <p>llms.txt 支持、通用爬取、智能分类</p>
      </div>
      <div class="rounded-xl border bg-card shadow-sm p-4">
        <h2 class="font-medium">GitHub 深度解析</h2>
        <p>AST、API 提取、Issues/PR/Releases、冲突检测</p>
      </div>
      <div class="rounded-xl border bg-card shadow-sm p-4">
        <h2 class="font-medium">PDF 提取</h2>
        <p>OCR、表格解析、并行加速</p>
      </div>
      <div class="rounded-xl border bg-card shadow-sm p-4">
        <h2 class="font-medium">多源合并</h2>
        <p>统一技能包与差异报告</p>
      </div>
      <div class="rounded-xl border bg-card shadow-sm p-4">
        <h2 class="font-medium">AI 增强</h2>
        <p>本地增强示例与关键概念</p>
      </div>
    </div>
    <div class="mb-6">
      <RouterLink class="btn-primary" to="/doc-skills/create">创建技能</RouterLink>
    </div>
    <div v-if="tasks.length===0" class="rounded-xl border bg-card shadow-sm p-8 text-center">
      尚未创建技能任务，点击上方按钮开始
    </div>
    <ul v-else class="space-y-3">
      <li v-for="t in tasks" :key="t.id" class="rounded-xl border bg-card shadow-sm p-4 flex items-center justify-between">
        <div>
          <div class="font-medium">任务 {{ t.id }}</div>
          <div class="text-sm text-muted-foreground">状态 {{ t.status }}｜进度 {{ t.progress }}%</div>
        </div>
        <RouterLink class="btn-outline" :to="`/doc-skills/tasks/${t.id}`">查看详情</RouterLink>
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useDocSkillsStore } from '@/stores/docSkills'
const store = useDocSkillsStore()
const tasks = ref<any[]>([])
onMounted(async () => {
  const r = await store.listMine({ page: '1', pageSize: '20' })
  tasks.value = r.items || []
})
</script>
```

```vue
<!-- CreateDocSkillPage.vue（完整选项映射 Skill Seeker 能力） -->
<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-2xl font-semibold mb-4">创建文档技能</h1>
    <div class="flex gap-2 mb-6">
      <button class="btn-outline" :class="active==='docs' && 'btn-primary'" @click="active='docs'">文档站点</button>
      <button class="btn-outline" :class="active==='github' && 'btn-primary'" @click="active='github'">GitHub 仓库</button>
      <button class="btn-outline" :class="active==='pdf' && 'btn-primary'" @click="active='pdf'">PDF 文件</button>
    </div>
    <form class="space-y-4" @submit.prevent="submit">
      <div v-if="active==='docs'" class="rounded-xl border bg-card shadow-sm p-4 space-y-3">
        <input class="input" v-model="docs.url" placeholder="文档站点 URL" />
        <input class="input" v-model="docs.preset" placeholder="预设（react/vue/django/godot/fastapi）" />
        <label class="flex items-center gap-2"><input type="checkbox" v-model="docs.useLlmsTxt" /> 使用 llms.txt</label>
        <label class="flex items-center gap-2"><input type="checkbox" v-model="enhanceLocal" /> 本地增强</label>
      </div>
      <div v-else-if="active==='github'" class="rounded-xl border bg-card shadow-sm p-4 space-y-3">
        <input class="input" v-model="github.repo" placeholder="owner/name" />
        <input class="input" v-model="github.branch" placeholder="分支（可选）" />
        <label class="flex items-center gap-2"><input type="checkbox" v-model="github.deepAst" /> AST 深度解析</label>
        <label class="flex items-center gap-2"><input type="checkbox" v-model="github.includeIssues" /> 包含 Issues</label>
        <label class="flex items-center gap-2"><input type="checkbox" v-model="github.includePRs" /> 包含 PRs</label>
        <label class="flex items-center gap-2"><input type="checkbox" v-model="github.includeReleases" /> 包含 Releases</label>
        <label class="flex items-center gap-2"><input type="checkbox" v-model="github.conflictDetect" /> 冲突检测（文档 vs 代码）</label>
        <label class="flex items-center gap-2"><input type="checkbox" v-model="enhanceLocal" /> 本地增强</label>
      </div>
      <div v-else class="rounded-xl border bg-card shadow-sm p-4 space-y-3">
        <input class="input" v-model="pdf.name" placeholder="技能名" />
        <input class="input" v-model="pdf.pdfUrl" placeholder="PDF 地址（占位）" />
        <label class="flex items-center gap-2"><input type="checkbox" v-model="pdf.ocr" /> OCR（扫描版）</label>
        <label class="flex items-center gap-2"><input type="checkbox" v-model="pdf.extractTables" /> 表格解析</label>
        <label class="flex items-center gap-2"><input type="checkbox" v-model="pdf.parallel" /> 并行处理</label>
        <input class="input" v-model.number="pdf.workers" type="number" min="1" max="16" placeholder="并行线程数（1-16）" />
        <label class="flex items-center gap-2"><input type="checkbox" v-model="enhanceLocal" /> 本地增强</label>
      </div>
      <div class="rounded-xl border bg-card shadow-sm p-4 space-y-3">
        <input class="input" v-model="output.skillName" placeholder="技能包名" />
        <input class="input" v-model="output.category" placeholder="分类（可选）" />
        <label class="flex items-center gap-2"><input type="checkbox" v-model="asyncMode" /> 异步执行</label>
        <label class="flex items-center gap-2"><input type="checkbox" v-model="cacheReuse" /> 复用缓存</label>
        <label class="flex items-center gap-2"><input type="checkbox" v-model="resumeCheckpoint" /> 断点续跑</label>
      </div>
      <div class="flex gap-3">
        <button class="btn-primary" type="submit">创建</button>
        <RouterLink class="btn-outline" to="/doc-skills">返回</RouterLink>
      </div>
    </form>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDocSkillsStore } from '@/stores/docSkills'
const router = useRouter()
const store = useDocSkillsStore()
const active = ref<'docs'|'github'|'pdf'>('docs')
const enhanceLocal = ref(true)
const asyncMode = ref(true)
const cacheReuse = ref(true)
const resumeCheckpoint = ref(true)
const output = ref({ skillName: '', category: '' })
const docs = ref({ url: '', preset: '', useLlmsTxt: true })
const github = ref({ repo: '', branch: '', deepAst: true, includeIssues: true, includePRs: true, includeReleases: true, conflictDetect: true })
const pdf = ref({ name: '', pdfUrl: '', ocr: true, extractTables: true, parallel: true, workers: 8 })
async function submit() {
  const sourceConfig = active.value==='docs' ? docs.value : active.value==='github' ? github.value : pdf.value
  const id = await store.createTask({ sourceType: active.value, sourceConfig, options: { enhanceLocal, asyncMode, cacheReuse, resumeCheckpoint }, output: output.value } as any)
  router.push(`/doc-skills/tasks/${id}`)
}
</script>
```

```vue
<!-- DocSkillTaskDetail.vue（异步任务展示） -->
<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-2xl font-semibold mb-4">任务详情</h1>
    <div class="rounded-xl border bg-card shadow-sm p-4 space-y-3" v-if="task">
      <div>状态：<span class="inline-block px-2 py-1 rounded bg-muted">{{ task.status }}</span></div>
      <div class="w-full bg-muted h-2 rounded"><div class="bg-primary h-2 rounded" :style="{ width: `${task.progress || 0}%` }"></div></div>
      <pre class="bg-muted p-3 rounded max-h-72 overflow-auto">{{ task.logs }}</pre>
      <div v-if="task.resultUrl"><a class="btn-outline" :href="task.resultUrl" target="_blank">下载技能包</a></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useDocSkillsStore } from '@/stores/docSkills'
const route = useRoute()
const store = useDocSkillsStore()
const task = ref<any>(null)
onMounted(async () => {
  const r = await store.fetchTask(route.params.id as string)
  task.value = r
})
</script>
```

## 验证与交付
- 登录保护生效：未登录点击菜单被拦截
- 页面可正常填表与提交，返回占位 `taskId` 并跳转详情
- 列表与详情使用占位接口数据渲染，无后端真实执行依赖

## 下一阶段预案
- 接入远程执行服务器与对象存储；日志分页与 SSE；冲突报告可视化（差异表与警告标识）

## 参考
- Skill Seeker 功能与 CLI 示例：https://github.com/hysteam/Skill_Seekers
- Supabase Storage：https://supabase.com/docs/guides/storage
- Vue Router 与守卫：https://router.vuejs.org/