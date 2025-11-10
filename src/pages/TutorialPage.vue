/**
 * 使用教程页面
 * 展示 AI 编程工具的使用指南与推荐工作流
 */
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部横幅（品牌渐变 + 渐隐） -->
    <div class="relative">
      <div
        class="h-40 md:h-56"
        style="background: linear-gradient(135deg, #FF7A45, #FF9A62);"
      ></div>
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-white/70"></div>
      <div class="absolute inset-x-0 bottom-0 pb-6">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="bg-white/90 backdrop-blur rounded-xl shadow-lg p-6 md:p-8">
            <h1 class="text-2xl md:text-3xl font-bold text-gray-900 inline-flex items-center gap-3">
              <Sparkles class="w-6 h-6 text-orange-600" /> 使用教程
            </h1>
            <p class="text-gray-700 mt-2">
              覆盖 Claude，Codebuddy 等 AI工具如何使用 Skills 的教程。
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 主体内容：工具卡片、对比与学习路径 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 md:-mt-12 space-y-10">
      <!-- 工具卡片 -->
      <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <article v-for="tool in tools" :key="tool.key" class="bg-white rounded-xl shadow p-6 border border-gray-100">
          <header class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <component :is="tool.icon" class="w-6 h-6 text-gray-800" />
              <h2 class="text-lg md:text-xl font-bold text-gray-900">{{ tool.name }}</h2>
            </div>
            <a v-if="tool.docsUrl" :href="tool.docsUrl" target="_blank" rel="noopener noreferrer" class="text-sm text-orange-700 hover:text-orange-600">官方文档</a>
            <span v-else class="text-sm text-gray-400">官方文档链接待确认</span>
          </header>
          <p class="text-gray-700">{{ tool.summary }}</p>
          <div class="grid grid-cols-1 gap-4 mt-4">
            <div>
              <h3 class="text-sm font-semibold text-gray-900">适用场景</h3>
              <ul class="list-disc list-inside text-gray-700 mt-1 space-y-1">
                <li v-for="s in tool.scenarios" :key="s">{{ s }}</li>
              </ul>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-gray-900">优势特点</h3>
              <ul class="list-disc list-inside text-gray-700 mt-1 space-y-1">
                <li v-for="f in tool.features" :key="f">{{ f }}</li>
              </ul>
            </div>
            <div class="bg-orange-50 border-l-4 border-orange-400 p-3 rounded">
              <p class="text-sm text-orange-900 inline-flex items-center gap-2">
                <Lightbulb class="w-4 h-4" /> 使用技巧：{{ tool.tips }}
              </p>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-gray-900">实战示例</h3>
              <ul class="list-disc list-inside text-gray-700 mt-1 space-y-1">
                <li v-for="e in tool.examples" :key="e">{{ e }}</li>
              </ul>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-gray-900">使用步骤</h3>
              <ol class="list-decimal list-inside text-gray-700 mt-1 space-y-1">
                <li v-for="(step, idx) in tool.steps" :key="idx">{{ step }}</li>
              </ol>
            </div>
          </div>
        </article>
      </section>

      <!-- 工具对比 -->
      <section class="bg-white rounded-xl shadow p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4 inline-flex items-center gap-2">
          <Table class="w-5 h-5 text-gray-800" /> 工具对比
        </h2>
        <div class="overflow-x-auto">
          <table class="min-w-full border border-gray-200 text-sm">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-3 py-2 text-left font-semibold text-gray-900">维度</th>
                <th class="px-3 py-2 text-left font-semibold text-gray-900">Claude</th>
                <th class="px-3 py-2 text-left font-semibold text-gray-900">Trae</th>
                <th class="px-3 py-2 text-left font-semibold text-gray-900">Cursor</th>
                <th class="px-3 py-2 text-left font-semibold text-gray-900">Codebuddy</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="px-3 py-2 text-gray-700">对话质量/长上下文</td>
                <td class="px-3 py-2">强（适合思考与重构）</td>
                <td class="px-3 py-2">强（IDE 深度集成）</td>
                <td class="px-3 py-2">中上（代码补全突出）</td>
                <td class="px-3 py-2">中（视产品版本）</td>
              </tr>
              <tr class="bg-gray-50">
                <td class="px-3 py-2 text-gray-700">代码生成/改写</td>
                <td class="px-3 py-2">强（指令理解到位）</td>
                <td class="px-3 py-2">强（项目级修改）</td>
                <td class="px-3 py-2">强（文件级流畅）</td>
                <td class="px-3 py-2">中</td>
              </tr>
              <tr>
                <td class="px-3 py-2 text-gray-700">本地开发体验</td>
                <td class="px-3 py-2">中（需配合 API/平台）</td>
                <td class="px-3 py-2">强（IDE 驱动）</td>
                <td class="px-3 py-2">强（编辑器内体验）</td>
                <td class="px-3 py-2">中</td>
              </tr>
              <tr class="bg-gray-50">
                <td class="px-3 py-2 text-gray-700">协作与工作流</td>
                <td class="px-3 py-2">中上（对话+文档）</td>
                <td class="px-3 py-2">强（任务/补丁/预览）</td>
                <td class="px-3 py-2">中上（变更建议）</td>
                <td class="px-3 py-2">中</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 学习路径 -->
      <section class="bg-white rounded-xl shadow p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-2 inline-flex items-center gap-2">
          <BookOpen class="w-5 h-5 text-gray-800" /> 学习路径建议
        </h2>
        <p class="text-gray-700 mb-4">从入门到进阶，按序建立你的 AI 编程工作流。</p>
        <div class="space-y-4">
          <div class="flex items-start gap-3">
            <span class="w-8 h-8 rounded-full bg-orange-100 text-orange-700 inline-flex items-center justify-center font-bold">1</span>
            <div>
              <h3 class="font-semibold text-gray-900">搭建环境与账号</h3>
              <p class="text-gray-700 text-sm">注册工具账号，确认 API Key 管理与费用控制；选择主力 IDE（建议 VS Code / Trae）。</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <span class="w-8 h-8 rounded-full bg-orange-100 text-orange-700 inline-flex items-center justify-center font-bold">2</span>
            <div>
              <h3 class="font-semibold text-gray-900">提示工程与代码约束</h3>
              <p class="text-gray-700 text-sm">学习编写明确、可测的要求；限制修改范围；引导工具遵循现有代码风格与规范。</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <span class="w-8 h-8 rounded-full bg-orange-100 text-orange-700 inline-flex items-center justify-center font-bold">3</span>
            <div>
              <h3 class="font-semibold text-gray-900">项目级协作</h3>
              <p class="text-gray-700 text-sm">掌握补丁（diff）审阅、分支策略、回滚与变更说明；建立评审清单。</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <span class="w-8 h-8 rounded-full bg-orange-100 text-orange-700 inline-flex items-center justify-center font-bold">4</span>
            <div>
              <h3 class="font-semibold text-gray-900">性能与安全</h3>
              <p class="text-gray-700 text-sm">在生成代码后进行安全检查（输入校验、RLS、权限控制）与性能基准测试。</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 参考与声明 -->
      <section class="bg-white rounded-xl shadow p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-2">参考链接与声明</h2>
        <ul class="list-disc list-inside text-gray-700 space-y-1">
          <li><a href="https://docs.anthropic.com" target="_blank" rel="noopener" class="text-orange-700 hover:text-orange-600">Claude 官方文档（Anthropic）</a></li>
          <li><a href="https://www.cursor.com" target="_blank" rel="noopener" class="text-orange-700 hover:text-orange-600">Cursor 官方网站</a></li>
          <li><a href="https://trae.ai" target="_blank" rel="noopener" class="text-orange-700 hover:text-orange-600">Trae 官方网站</a></li>
          <li>Codebuddy 官方文档链接：<span class="text-gray-500">我不确定，建议以你使用的产品版本为准</span></li>
        </ul>
        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded mt-3">
          <p class="text-yellow-800 text-sm">以上信息以各工具官方文档为准；实际功能与界面可能随产品迭代变更。</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FileText, Archive, File, Upload, Search, Star, Users, HelpCircle, Sparkles, Lightbulb, Table, BookOpen, Bot, Terminal } from 'lucide-vue-next'
import type { Component } from 'vue'

/**
 * 工具教程数据结构。
 */
interface ToolGuide {
  key: string
  name: string
  icon: Component
  summary: string
  scenarios: string[]
  features: string[]
  tips: string
  examples: string[]
  steps: string[]
  docsUrl?: string
}

/**
 * 工具列表：基于广泛认知整理的入门指南。
 * - docsUrl：尽量提供官方站点/文档链接；未知时省略并在 UI 中提示。
 */
const tools: ToolGuide[] = [
  {
    key: 'claude',
    name: 'Claude',
    icon: Bot,
    summary: '擅长长上下文推理与结构化代码改写，适合重构、文档生成与复杂需求拆解。',
    scenarios: ['复杂需求分析与拆解', '跨文件重构与注释补全', '生成技术文档/测试用例'],
    features: ['强大的自然语言理解', '较好的一致性与安全性', '适合提示工程实验'],
    tips: '提供明确的约束（文件范围、风格、边界条件），让其在有限范围内高质量发挥。',
    examples: ['将旧版 API 迁移到新接口并生成 diff', '为关键函数补充 JSDoc 与单测模板'],
    docsUrl: 'https://docs.anthropic.com',
    steps: [
      '打开 Claude（Web/桌面端），新建对话会话',
      '粘贴需求与代码片段，明确修改范围与风格约束',
      '要求输出“补丁/重构方案+代码块”，便于审阅与应用',
      '让其同时生成 JSDoc 与单测草稿，保证可维护性',
      '在 IDE 中应用并运行验证，必要时迭代微调提示'
    ]
  },
  {
    key: 'trae',
    name: 'Trae',
    icon: Terminal,
    summary: '以 IDE 为中心的智能开发体验，强调任务管理、文件补丁与预览协作。',
    scenarios: ['项目级代码修改与补丁审阅', '与预览服务器联动验证更改', '多人协作/任务清单跟进'],
    features: ['工具链集成与上下文检索', '变更可视化（diff/预览）', '工作流清晰易追踪'],
    tips: '将需求拆成清晰的待办项（Todo），逐项产出补丁并即时预览，避免一次性大改动。',
    examples: ['在多个文件中统一重构命名，并提供可审阅的补丁', '预览页面后微调 UI 与加载体验'],
    docsUrl: 'https://trae.ai',
    steps: [
      '在 Trae 中打开项目，创建待办任务（Todo）',
      '使用代码检索定位相关文件与逻辑',
      '生成补丁（diff）并查看可视化变更',
      '启动/打开预览地址进行交互验证',
      '提交或回滚补丁，更新任务状态与说明'
    ]
  },
  {
    key: 'cursor',
    name: 'Cursor',
    icon: Terminal,
    summary: '面向 VS Code 的增强型 AI 编程体验，代码补全与文件对话顺畅。',
    scenarios: ['快速生成文件骨架', '在编辑器侧边栏与文件对话', '本地调试中进行增量改写'],
    features: ['与编辑器深度融合', '优秀的补全与重写性能', '适合日常迭代与小步提交'],
    tips: '控制修改范围（当前文件/选区），让补全更稳定可控；频繁预览增量变更。',
    examples: ['为组件生成 Prop 类型与默认值', '将旧样式迁移为 Tailwind 原子类'],
    docsUrl: 'https://www.cursor.com',
    steps: [
      '在 Cursor 中打开项目文件或选中需要改写的代码',
      '使用侧边栏与文件对话，描述目标与约束',
      '触发补全/重写，限定“仅当前文件/选区”范围',
      '应用变更后运行本地测试或预览',
      '小步提交，保留可回滚的迭代历史'
    ]
  },
  {
    key: 'codebuddy',
    name: 'Codebuddy',
    icon: Bot,
    summary: '提供代码助手能力的产品（以具体版本为准），适合日常问答与模板生成。',
    scenarios: ['快速问答与代码片段生成', '为重复任务建立模板', '团队共享提示与流程'],
    features: ['上手简单', '适合轻量协作', '可作为其他工具的补充'],
    tips: '将高频任务固化为模板与提示集，降低重复劳动；输出后进行人工审阅。',
    examples: ['生成接口封装模板并按团队规范调整', '汇总日志为问题定位清单'],
    steps: [
      '创建或选择常用提示模板（模板内含边界与风格）',
      '输入上下文与变量，生成初稿代码片段',
      '人工审阅并对齐团队规范（lint/格式/命名）',
      '在 IDE 中集成与验证功能行为',
      '沉淀高频场景为共享模板，提升复用率'
    ]
  }
]
</script>