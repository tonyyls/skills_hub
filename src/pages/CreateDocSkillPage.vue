<template>
  <div class="max-w-5xl mx-auto px-6 sm:px-8 lg:px-10 py-10">
    <h1 class="text-3xl font-semibold mb-6">创建文档技能</h1>
    <ol class="flex items-center w-full text-lg text-gray-600 mb-8">
      <li class="flex items-center">
        <span class="inline-flex items-center justify-center w-9 h-9 rounded-full text-base font-semibold" :class="step>=1 ? 'bg-[#FF7A45] text-white' : 'bg-gray-200 text-gray-700'">1</span>
        <span class="ml-2">填写信息</span>
      </li>
      <span class="mx-3 h-px w-16 bg-gray-300"></span>
      <li class="flex items-center">
        <span class="inline-flex items-center justify-center w-9 h-9 rounded-full text-base font-semibold" :class="step>=2 ? 'bg-[#FF7A45] text-white' : 'bg-gray-200 text-gray-700'">2</span>
        <span class="ml-2">生成配置</span>
      </li>
      <span class="mx-3 h-px w-16 bg-gray-300"></span>
      <li class="flex items-center">
        <span class="inline-flex items-center justify-center w-9 h-9 rounded-full text-base font-semibold" :class="step>=3 ? 'bg-[#FF7A45] text-white' : 'bg-gray-200 text-gray-700'">3</span>
        <span class="ml-2">生成技能</span>
      </li>
    </ol>

    <div v-if="step===1" class="rounded-xl border bg-white shadow-sm p-4 space-y-3 mb-6">
      <input class="w-full px-3 py-2 border rounded" v-model="basic.skillName" placeholder="技能名称" />
      <textarea class="w-full px-3 py-2 border rounded" v-model="basic.description" rows="4" placeholder="技能描述" maxlength="500"></textarea>
      <div class="text-right text-xs text-gray-500">{{ (basic.description || '').length }}/500</div>
      <div class="flex items-center gap-4">
        <label class="flex items-center gap-2 px-3 py-2 border rounded cursor-pointer"
        :class="basic.language==='zh-CN' ? 'bg-[#FFF5EF] text-[#FF7A45] border-[#FF7A45]' : ''">
          <input type="radio" value="zh-CN" v-model="basic.language" />
          中文
        </label>
        <label class="flex items-center gap-2 px-3 py-2 border rounded cursor-pointer"
        :class="basic.language==='en' ? 'bg-[#FFF5EF] text-[#FF7A45] border-[#FF7A45]' : ''">
          <input type="radio" value="en" v-model="basic.language" />
          English
        </label>
      </div>
      <div class="flex items-center gap-4">
        <label class="flex items-center gap-2 px-3 py-2 border rounded cursor-pointer" :class="active==='docs' ? 'bg-[#FFF5EF] text-[#FF7A45] border-[#FF7A45]' : ''">
          <input type="radio" value="docs" v-model="active" />
          文档站点
        </label>
        <label class="flex items-center gap-2 px-3 py-2 border rounded cursor-pointer" :class="active==='github' ? 'bg-[#FFF5EF] text-[#FF7A45] border-[#FF7A45]' : ''">
          <input type="radio" value="github" v-model="active" />
          GitHub 仓库
        </label>
        <label class="flex items-center gap-2 px-3 py-2 border rounded cursor-pointer" :class="active==='pdf' ? 'bg-[#FFF5EF] text-[#FF7A45] border-[#FF7A45]' : ''">
          <input type="radio" value="pdf" v-model="active" />
          PDF 文件
        </label>
      </div>
      <div class="flex gap-3">
        <button class="px-4 py-2 bg-gradient-to-r from-[#FF6A3A] to-[#FF7A45] text-white rounded" :disabled="!basic.skillName" @click="step=2">下一步</button>
        <RouterLink class="px-4 py-2 border rounded text-[#333] hover:text-[#FF7A45] hover:bg-[#FFF5EF]" to="/doc-skills">取消</RouterLink>
      </div>
    </div>
    
    <form v-if="step>=2" class="space-y-4" @submit.prevent="submit">
      <div v-if="step===2 && active==='docs'" class="space-y-6">
        <div class="rounded-xl border bg-white shadow-sm p-6 space-y-3">
          <div class="text-base font-medium">基础地址</div>
          <input class="w-full px-3 py-2 border rounded" :class="docsValidated && baseUrlInvalid ? 'border-red-500' : ''" v-model="docs.baseUrl" placeholder="文档基础地址，例如：https://react.dev/" />
          <div v-if="docsValidated && baseUrlInvalid" class="text-xs text-red-500">请输入以 http:// 或 https:// 开头的有效地址</div>
        </div>
        <div class="rounded-xl border bg-white shadow-sm p-6 space-y-3">
          <div class="flex items-center justify-between">
            <div class="text-base font-medium">文档地址</div>
            <div class="text-xs text-gray-500">文档数量：{{ docs.urls.length }}</div>
          </div>
          <div v-for="(u, i) in docs.urls" :key="i" class="flex gap-2 items-center">
            <input class="flex-1 px-3 py-2 border rounded" :class="docsValidated && urlsInvalid[i] ? 'border-red-500' : ''" v-model="docs.urls[i]" placeholder="例如：https://react.dev/learn/quick-start" />
            <button type="button" class="p-2 border rounded" @click="removeDocUrl(i)" :disabled="docs.urls.length===1" title="移除">
              <MinusCircle class="w-4 h-4" />
            </button>
            <div v-if="docsValidated && urlsInvalid[i]" class="text-xs text-red-500">无效地址</div>
          </div>
          <button type="button" class="px-2 py-1 border rounded inline-flex items-center gap-1 text-sm" @click="addDocUrl">
            <Plus class="w-3 h-3" />
            添加文档地址
          </button>
        </div>
        <div class="rounded-xl border bg-white shadow-sm p-6 space-y-4">
          <div class="text-base font-medium">文档分类</div>
          <div class="space-y-3">
            <div v-for="(c, ci) in docs.categories" :key="`cat-${ci}`" class="flex items-center gap-3">
              <div class="flex items-center gap-2 w-64">
                <input class="w-full px-3 py-2 border rounded" v-model="docs.categories[ci].name" placeholder="分类名称，例如：getting_started" />
                <button type="button" class="p-2 border rounded" @click="removeCategory(ci)" :disabled="docs.categories.length===1" title="移除分类">
                  <MinusCircle class="w-4 h-4" />
                </button>
              </div>
              <div class="flex-1">
                <div class="flex flex-wrap items-center gap-2 px-2 py-2 border rounded">
                  <span v-for="(k, ki) in c.keywords" :key="`kw-${ci}-${ki}`" class="inline-flex items-center gap-1 px-2 py-1 border rounded-full text-sm">
                    {{ k }}
                    <button type="button" class="p-1" @click="removeKeyword(ci, ki)" :disabled="c.keywords.length===1" title="移除">
                      <X class="w-3 h-3" />
                    </button>
                  </span>
                  <input class="flex-1 min-w-[140px] px-2 py-1 outline-none" v-model="newKeywordInputs[ci]" @keydown.enter.prevent="addKeywordFromInput(ci)" placeholder="输入后回车添加" />
                </div>
              </div>
            </div>
              <button type="button" class="px-2 py-1 border rounded inline-flex items-center gap-1 text-sm" @click="addCategory">
                <Plus class="w-3 h-3" />
                添加分类
              </button>
          </div>
        </div>
        <div class="rounded-xl border bg-white shadow-sm p-6 space-y-4">
          <div class="text-base font-medium">高级设置</div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-gray-600 mb-1">每秒请求速率</label>
              <input class="w-full px-3 py-2 border rounded" v-model.number="docs.rateLimit" type="number" min="0" max="10" step="0.1" placeholder="例如 0.5" />
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">最大页数</label>
              <input class="w-full px-3 py-2 border rounded" v-model.number="docs.maxPages" type="number" min="1" max="10000" step="1" placeholder="例如 300" />
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <div class="text-sm text-gray-600">包含路径</div>
              <div v-for="(p, i) in docs.includePatterns" :key="`inc-${i}`" class="flex gap-2 items-center">
                <input class="flex-1 px-3 py-2 border rounded" v-model="docs.includePatterns[i]" placeholder="例如：/learn" />
                <button type="button" class="p-2 border rounded" @click="removeIncludePattern(i)" :disabled="docs.includePatterns.length===1" title="移除">
                  <MinusCircle class="w-4 h-4" />
                </button>
              </div>
              <button type="button" class="px-2 py-1 border rounded inline-flex items-center gap-1 text-sm" @click="addIncludePattern">
                <Plus class="w-3 h-3" />
                添加包含路径
              </button>
            </div>
            <div class="space-y-2">
              <div class="text-sm text-gray-600">排除路径</div>
              <div v-for="(p, i) in docs.excludePatterns" :key="`exc-${i}`" class="flex gap-2 items-center">
                <input class="flex-1 px-3 py-2 border rounded" v-model="docs.excludePatterns[i]" placeholder="例如：/community" />
                <button type="button" class="p-2 border rounded" @click="removeExcludePattern(i)" :disabled="docs.excludePatterns.length===1" title="移除">
                  <MinusCircle class="w-4 h-4" />
                </button>
              </div>
              <button type="button" class="px-2 py-1 border rounded inline-flex items-center gap-1 text-sm" @click="addExcludePattern">
                <Plus class="w-3 h-3" />
                添加排除路径
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="step===2 && active==='github'" class="rounded-xl border bg-white shadow-sm p-4 space-y-3">
        <input class="w-full px-3 py-2 border rounded" v-model="github.repo" placeholder="owner/name" />
        <input class="w-full px-3 py-2 border rounded" v-model="github.branch" placeholder="分支（可选）" />
        <label class="flex items-center gap-2"><input type="checkbox" v-model="github.deepAst" /> AST 深度解析</label>
        <label class="flex items-center gap-2"><input type="checkbox" v-model="github.includeIssues" /> 包含 Issues</label>
        <label class="flex items-center gap-2"><input type="checkbox" v-model="github.includePRs" /> 包含 PRs</label>
        <label class="flex items-center gap-2"><input type="checkbox" v-model="github.includeReleases" /> 包含 Releases</label>
        <label class="flex items-center gap-2"><input type="checkbox" v-model="github.conflictDetect" /> 冲突检测（文档 vs 代码）</label>
      </div>
      <div v-else-if="step===2 && active==='pdf'" class="rounded-xl border bg-white shadow-sm p-4 space-y-3">
        <input class="w-full px-3 py-2 border rounded" v-model="pdf.name" placeholder="技能名" />
        <input class="w-full px-3 py-2 border rounded" v-model="pdf.pdfUrl" placeholder="PDF 地址（占位）" />
        <label class="flex items-center gap-2"><input type="checkbox" v-model="pdf.ocr" /> OCR（扫描版）</label>
        <label class="flex items-center gap-2"><input type="checkbox" v-model="pdf.extractTables" /> 表格解析</label>
        <label class="flex items-center gap-2"><input type="checkbox" v-model="pdf.parallel" /> 并行处理</label>
        <input class="w-full px-3 py-2 border rounded" v-model.number="pdf.workers" type="number" min="1" max="16" placeholder="并行线程数（1-16）" />
      </div>
      <div v-if="step===3" class="rounded-xl border bg-white shadow-sm p-4 space-y-3">
        <div class="font-medium">执行选项</div>
        <label class="flex items-center gap-2"><input type="checkbox" v-model="enhanceLocal" /> 本地增强</label>
        <label class="flex items-center gap-2"><input type="checkbox" v-model="asyncMode" /> 异步执行</label>
        <label class="flex items-center gap-2"><input type="checkbox" v-model="cacheReuse" /> 复用缓存</label>
        <label class="flex items-center gap-2"><input type="checkbox" v-model="resumeCheckpoint" /> 断点续跑</label>
        <div class="text-sm text-gray-600">
          将以异步任务提交生成，完成后可在任务详情页查看进度与下载包。
        </div>
        <div class="mt-4 rounded-lg border bg-white p-4">
          <div v-if="generating" class="flex items-center gap-3">
            <Loader2 class="w-5 h-5 animate-spin text-[#FF7A45]" />
            <span class="text-[#333]">正在创建技能任务...</span>
          </div>
          <div v-else>
            <div class="text-green-600">技能任务已创建<span v-if="createdTaskId">（ID：{{ createdTaskId }}）</span></div>
            <div class="flex gap-3 mt-3">
              <button class="px-3 py-2 border rounded" type="button" @click="router.back()">关闭</button>
              <RouterLink class="px-3 py-2 border rounded" to="/doc-skills">回到任务列表</RouterLink>
              <RouterLink v-if="createdTaskId" class="px-3 py-2 border rounded" :to="`/doc-skills/tasks/${createdTaskId}`">查看任务详情</RouterLink>
            </div>
          </div>
        </div>
        <div class="mt-4 rounded-lg border bg-white p-4">
          <div class="font-medium mb-2">配置摘要</div>
          <ul class="text-sm text-gray-700 space-y-1">
            <li>类型：{{ active }}</li>
            <li v-if="active==='docs'">基础地址：{{ docs.baseUrl || '（未填写）' }}</li>
            <li v-if="active==='docs'">文档数量：{{ (docs.urls || []).length }}</li>
            <li v-if="active==='docs'">包含路径：{{ (docs.includePatterns || []).length }}，排除路径：{{ (docs.excludePatterns || []).length }}</li>
            <li v-if="active==='docs'">分类：{{ (docs.categories || []).length }}</li>
            <li v-if="active==='github'">仓库：{{ github.repo || '（未填写）' }}，分支：{{ github.branch || '（未填写）' }}</li>
            <li v-if="active==='pdf'">PDF：{{ pdf.pdfUrl || '（未填写）' }}，技能名：{{ pdf.name || '（未填写）' }}</li>
          </ul>
        </div>
      </div>
      <div class="flex gap-3">
        <button v-if="step===2" class="px-4 py-2 bg-gradient-to-r from-[#FF6A3A] to-[#FF7A45] text-white rounded" type="button" @click="nextStep">开始生成</button>
        <button v-else class="px-4 py-2 bg-gradient-to-r from-[#FF6A3A] to-[#FF7A45] text-white rounded" type="button" @click="submit">生成技能</button>
        <button class="px-4 py-2 border rounded" type="button" @click="step=step===2?1:2">上一步</button>
        <RouterLink class="px-4 py-2 border rounded text-[#333] hover:text-[#FF7A45] hover:bg-[#FFF5EF]" to="/doc-skills">取消</RouterLink>
      </div>
    </form>
  </div>
  
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDocSkillsStore } from '@/stores/docSkills'
import { Plus, MinusCircle, X, Loader2 } from 'lucide-vue-next'
const router = useRouter()
const store = useDocSkillsStore()
const step = ref<number>(1)
const active = ref<'docs'|'github'|'pdf'>('docs')
const enhanceLocal = ref(true)
const asyncMode = ref(true)
const cacheReuse = ref(true)
const resumeCheckpoint = ref(true)
const basic = ref({ skillName: '示例技能：React 文档与仓库', description: '自动抓取 React 官方文档与 GitHub 仓库，生成 Claude 可用技能包（含 llms.txt、AST 解析与冲突检测示例）。', language: 'zh-CN' })
const docs = ref({ baseUrl: 'https://react.dev/', urls: ['https://react.dev/learn/quick-start'], rateLimit: 0.5, maxPages: 300, includePatterns: [], excludePatterns: [], categories: [ { name: '', keywords: [] } ] })
const newKeywordInputs = ref<string[]>([''])
const github = ref({ repo: '', branch: '', deepAst: true, includeIssues: true, includePRs: true, includeReleases: true, conflictDetect: true })
const pdf = ref({ name: '', pdfUrl: '', ocr: true, extractTables: true, parallel: true, workers: 8 })
const generating = ref(false)
const createdTaskId = ref<string | null>(null)
async function submit() {
  const sourceConfig = active.value==='docs' ? docs.value : active.value==='github' ? github.value : pdf.value
  const payload = active.value==='docs'
    ? { sourceType: 'docs', sourceConfig: { baseUrl: (docs.value.baseUrl || '').trim(), urls: (docs.value.urls || []).map(v => (v || '').trim()).filter(Boolean), rate_limit: docs.value.rateLimit, max_pages: docs.value.maxPages, url_patterns: { include: (docs.value.includePatterns || []).map(v => (v || '').trim()).filter(Boolean), exclude: (docs.value.excludePatterns || []).map(v => (v || '').trim()).filter(Boolean) }, categories: Object.fromEntries((docs.value.categories || []).map(c => [String(c.name || '').trim(), (c.keywords || []).map(x => (x || '').trim()).filter(Boolean)])).filter ? Object.fromEntries(Object.entries(Object.fromEntries((docs.value.categories || []).map(c => [String(c.name || '').trim(), (c.keywords || []).map(x => (x || '').trim()).filter(Boolean)]))).filter(([k, v]) => k && v.length > 0)) : Object.fromEntries((docs.value.categories || []).map(c => [String(c.name || '').trim(), (c.keywords || []).map(x => (x || '').trim()).filter(Boolean)]) ) }, options: { enhanceLocal: enhanceLocal.value, asyncMode: asyncMode.value, cacheReuse: cacheReuse.value, resumeCheckpoint: resumeCheckpoint.value }, output: { skillName: basic.value.skillName, description: (basic.value.description || '').slice(0, 500), language: basic.value.language } }
    : { sourceType: active.value, sourceConfig, options: { enhanceLocal: enhanceLocal.value, asyncMode: asyncMode.value, cacheReuse: cacheReuse.value, resumeCheckpoint: resumeCheckpoint.value }, output: { skillName: basic.value.skillName, description: (basic.value.description || '').slice(0, 500), language: basic.value.language } }
  generating.value = true
  createdTaskId.value = null
  try {
    const id = await store.createTask(payload as any)
    createdTaskId.value = id
  } finally {
    generating.value = false
  }
}

function addDocUrl() {
  docs.value.urls.push('')
  urlsInvalid.value.push(false)
}

function removeDocUrl(i: number) {
  if (docs.value.urls.length === 1) return
  docs.value.urls.splice(i, 1)
  urlsInvalid.value.splice(i, 1)
}

function addIncludePattern() {
  docs.value.includePatterns.push('')
}

function removeIncludePattern(i: number) {
  if (docs.value.includePatterns.length === 1) return
  docs.value.includePatterns.splice(i, 1)
}

function addExcludePattern() {
  docs.value.excludePatterns.push('')
}

function removeExcludePattern(i: number) {
  if (docs.value.excludePatterns.length === 1) return
  docs.value.excludePatterns.splice(i, 1)
}

function addCategory() {
  docs.value.categories.push({ name: '', keywords: [] })
  newKeywordInputs.value.push('')
}

function removeCategory(i: number) {
  if (docs.value.categories.length === 1) return
  docs.value.categories.splice(i, 1)
  newKeywordInputs.value.splice(i, 1)
}

function addKeyword(ci: number) {
  docs.value.categories[ci].keywords.push('')
}

function removeKeyword(ci: number, ki: number) {
  if (docs.value.categories[ci].keywords.length === 1) return
  docs.value.categories[ci].keywords.splice(ki, 1)
}

function addKeywordFromInput(ci: number) {
  const v = (newKeywordInputs.value[ci] || '').trim()
  if (!v) return
  docs.value.categories[ci].keywords.push(v)
  newKeywordInputs.value[ci] = ''
}

const docsValidated = ref(false)
const baseUrlInvalid = ref(false)
const urlsInvalid = ref<boolean[]>(docs.value.urls.map(() => false))

function isValidHttpUrl(u: string) {
  try {
    const url = new URL(u)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function validateDocs() {
  docsValidated.value = true
  baseUrlInvalid.value = !isValidHttpUrl((docs.value.baseUrl || '').trim())
  urlsInvalid.value = docs.value.urls.map((v) => !isValidHttpUrl((v || '').trim()))
  const hasValidUrl = docs.value.urls.some((v) => isValidHttpUrl((v || '').trim()))
  return !baseUrlInvalid.value && hasValidUrl && urlsInvalid.value.every((x) => !x)
}

function validateGithub() {
  const repo = (github.value.repo || '').trim()
  const pattern = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/
  return pattern.test(repo)
}

function validatePdf() {
  const nameOk = !!(pdf.value.name || '').trim()
  const urlOk = isValidHttpUrl((pdf.value.pdfUrl || '').trim())
  return nameOk && urlOk
}

function nextStep() {
  if (active.value === 'docs') {
    if (!validateDocs()) return
    step.value = 3
    submit()
    return
  }
  if (active.value === 'github') {
    if (!validateGithub()) return
    step.value = 3
    submit()
    return
  }
  if (active.value === 'pdf') {
    if (!validatePdf()) return
    step.value = 3
    submit()
    return
  }
}
// 选择全部快捷键（Ctrl/Cmd + A）在浏览器默认支持，无需自定义指令
</script>