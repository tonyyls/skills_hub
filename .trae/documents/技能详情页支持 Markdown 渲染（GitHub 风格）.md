# 技能详情页支持 Markdown 渲染（GitHub 风格）

> 目标：将技能内容（`skill.content`，Markdown 文本）在详情页中按 GitHub Markdown 样式安全渲染，替换当前纯文本 `<p>` 显示。仅在技能内容区域启用渲染，其他页面不受影响。

## 依赖与样式
- 新增依赖（前端）
  - `markdown-it`：Markdown → HTML 解析
  - `dompurify`：HTML 安全清洗防 XSS
  - `github-markdown-css`：GitHub 风格的 Markdown 全局样式
- 全局样式引入
  - 在 `src/style.css` 或 `src/main.ts` 引入：`import 'github-markdown-css/github-markdown.css'`

## 技术实现
- 新增工具函数 `src/utils/markdown.ts`
```ts
/**
 * 将 Markdown 文本渲染为安全的 HTML。
 * - 使用 markdown-it 解析，开启 linkify 与软换行
 * - 使用 DOMPurify 清洗，防止 XSS
 */
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'

const md = new MarkdownIt({ html: false, linkify: true, breaks: true })

export function renderMarkdown(input: string): string {
  const rawHtml = md.render(input || '')
  /**
   * 清洗允许的标签与属性（保持默认策略即可，必要时可定制 allowlist）
   */
  const safeHtml = DOMPurify.sanitize(rawHtml)
  return safeHtml
}
```

- 页面改造（`src/pages/SkillDetailPage.vue`）
  - 位置：概述区“是什么？”
  - 将原有纯文本 `<p class="text-gray-700 leading-relaxed">{{ skill.content || ... }}</p>` 替换为 GitHub 风格容器：
```vue
<div class="markdown-body">
  <div v-if="skill && skill.content" v-html="mdHtml"></div>
  <p v-else class="text-gray-500">暂无描述。</p>
</div>
```
  - 计算属性：
```ts
/**
 * 将技能内容从 Markdown 渲染为安全 HTML（GitHub 样式）
 */
import { renderMarkdown } from '@/utils/markdown'

const mdHtml = computed<string>(() => {
  const src = skill.value?.content || skill.value?.description || ''
  return renderMarkdown(src)
})
```

## 样式与布局
- 使用 `github-markdown-css` 提供的类名 `markdown-body` 包裹内容，确保列表、标题、代码块、链接等按 GitHub 风格显示。
- 仅作用于技能详情页的内容区域，避免影响其他组件的 Tailwind 样式。

## 安全考量
- 禁止在解析器开启 `html: true`，避免 Markdown 内嵌 HTML 注入风险。
- 所有渲染结果经过 DOMPurify 清洗。
- 链接默认由 markdown-it 处理，后续可追加 target 和 rel（如需）：
```ts
md.linkify
// 渲染阶段可通过 renderer.rules.link_open 覆盖，统一加 target="_blank" rel="noopener noreferrer"
```

## 验证与测试
- 用示例 Markdown 验证：标题/列表/链接/代码块/图片/粗斜体等元素渲染正确。
- 空内容显示“暂无描述”。
- 开发环境：检查浏览器控制台无 XSS 相关警告；链接跳转安全。

## 备选方案（如不引入依赖）
- 服务端渲染（Supabase Edge Functions / Serverless）：后端将 Markdown 转 HTML 并清洗，前端仅渲染。优点：减轻前端负担；缺点：增加后端复杂度与延迟。

## 变更范围（预期 diff）
- `package.json`：新增依赖 `markdown-it`、`dompurify`、`github-markdown-css`
- `src/style.css` 或 `src/main.ts`：引入 GitHub Markdown CSS
- 新增 `src/utils/markdown.ts`
- 修改 `src/pages/SkillDetailPage.vue`：“是什么？”区域改为渲染 Markdown 的 `markdown-body` 容器 + `v-html` 安全输出

请确认以上方案，确认后我将进行依赖安装、工具函数与页面改造，并在本地完成验证。