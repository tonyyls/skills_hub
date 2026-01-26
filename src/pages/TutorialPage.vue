/**
 * 使用教程页面
 * 展示 AI 编程工具的使用指南与推荐工作流
 */
<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
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
              <Sparkles class="w-6 h-6 text-orange-600" /> {{ t('pages.tutorial.title') }}
            </h1>
            <p class="text-gray-700 mt-2">
              {{ t('pages.tutorial.intro') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 主体内容：安装 CLI + 工具使用 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 md:mt-8 space-y-8 pb-12">
      
      <!-- 第一步：安装 CLI -->
      <section class="bg-white rounded-2xl shadow-xl p-8 border border-orange-100">
        <header class="flex items-center gap-4 mb-6">
          <div class="bg-purple-100 p-3 rounded-full">
            <Terminal class="w-8 h-8 text-purple-600" />
          </div>
          <h2 class="text-xl md:text-2xl font-bold text-gray-900">{{ t('pages.tutorial.installCliTitle') }}</h2>
        </header>
        <p class="text-gray-700 mb-6 text-lg leading-relaxed">{{ t('pages.tutorial.installCliDesc') }}</p>
        <div class="bg-gray-900 rounded-xl p-6 relative group">
          <code class="text-green-400 font-mono text-lg block">npm install -g skills-hub-cli</code>
          <button 
            @click="copyCommand('npm install -g skills-hub-cli')"
            class="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            :title="t('pages.skillDetail.copyInstall')"
          >
            <Copy class="w-5 h-5" />
          </button>
        </div>
      </section>

      <!-- 第二步：安装技能 -->
      <section class="bg-white rounded-2xl shadow-xl p-8 border border-orange-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
        <header class="flex items-center gap-4 mb-6">
          <div class="bg-blue-100 p-3 rounded-full">
            <Code class="w-8 h-8 text-blue-600" />
          </div>
          <h2 class="text-xl md:text-2xl font-bold text-gray-900">{{ t('pages.tutorial.installSkillTitle') }}</h2>
        </header>
        <p class="text-gray-700 mb-6 text-lg leading-relaxed">{{ t('pages.tutorial.installSkillDesc') }}</p>
        <div class="bg-gray-900 rounded-xl p-6 relative group">
          <code class="text-green-400 font-mono text-lg block break-all">skills-hub add &lt;repo-url&gt; --skill &lt;skill-name&gt;</code>
          <button 
            @click="copyCommand('skills-hub add <repo-url> --skill <skill-name>')"
            class="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            :title="t('pages.skillDetail.copyInstall')"
          >
            <Copy class="w-5 h-5" />
          </button>
        </div>

        <!-- CLI 截图 -->
        <div class="mt-8 rounded-xl overflow-hidden border border-gray-200 shadow-md">
          <img 
            src="https://camo.githubusercontent.com/3362e1f1d2b4e532c64da5c15b659561268570b0a720e19fdb8a7e98bbc45b20/68747470733a2f2f67697465652e636f6d2f6b6573616e61692f736b696c6c732d6875622d636c692f7261772f6d61737465722f736e617073686f742d636c692e706e67" 
            alt="CLI Usage Example" 
            class="w-full h-auto object-cover"
            loading="lazy"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { 
  Sparkles, 
  Lightbulb, 
  Bot, 
  ExternalLink, 
  List, 
  Code, 
  Copy, 
  Terminal
} from 'lucide-vue-next'

/**
 * 工具教程数据结构。
 */
/**
 * 页面说明：
 * - 本教程页面采用上下两张卡片的静态内容结构。
 * - 后续若需动态加载内容，可在此处添加请求与状态管理。
 */

/**
 * 工具列表：基于广泛认知整理的入门指南。
 * - docsUrl：尽量提供官方站点/文档链接；未知时省略并在 UI 中提示。
 */
// 本页暂不需要脚本数据。
const { t } = useI18n()

const copyCommand = (cmd: string) => {
  navigator.clipboard.writeText(cmd)
}
</script>