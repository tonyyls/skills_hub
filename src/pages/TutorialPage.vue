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
          <div class="bg-white/90 backdrop-blur rounded-xl shadow-lg p-6 md:p-8 transform hover:scale-105 transition-transform duration-300">
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

    <!-- 主体内容：上下两张卡片（Claude 应用、CodeBuddy） -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 md:mt-8 space-y-8 pb-12">
      <!-- 卡片1：Claude 应用中使用 Skills -->
      <section class="bg-white rounded-2xl shadow-xl p-8 border border-orange-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
        <header class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-4">
            <div class="bg-orange-100 p-3 rounded-full">
              <Bot class="w-8 h-8 text-orange-600" />
            </div>
            <h2 class="text-xl md:text-2xl font-bold text-gray-900">Claude 应用中如何使用 Skills</h2>
          </div>
          
        </header>
        <p class="text-gray-700 mb-6 text-lg leading-relaxed">Claude 应该包括 Claude Code、Claude AI 等是 Anthropic 旗下的产品，结合 Skills Hub，能快速引入技能到这些应用中。</p>
        <div class="space-y-6">
          <div class="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <List class="w-5 h-5 text-orange-600" />
              使用步骤
            </h3>
            <ol class="list-decimal list-inside text-gray-700 space-y-3">
              <li class="flex items-start gap-2">
                <span class="mt-1">1、打开 Claude 应用的命令行，</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="mt-1">2、找到对应技能的安装命令（例如 <code class="bg-orange-200 px-2 py-1 rounded text-sm">/plugin marketplace add lackeyjb-playwright-skill</code>），并执行安装，</span>
              </li>
            </ol>
          </div>
          
          
        </div>
      </section>

      <!-- 卡片2：CodeBuddy 中使用 Skills -->
      <section class="bg-white rounded-2xl shadow-xl p-8 border border-orange-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
        <header class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-4">
            <div class="bg-blue-100 p-3 rounded-full">
              <Bot class="w-8 h-8 text-blue-600" />
            </div>
            <h2 class="text-xl md:text-2xl font-bold text-gray-900">CodeBuddy 中如何使用 Skills</h2>
          </div>
          
        </header>
        <p class="text-gray-700 mb-6 text-lg leading-relaxed">CodeBuddy是腾讯出品的AI原生IDE，结合Skills Hub，你可以在AI编程过程中使用这些技能。</p>
        <div class="space-y-4">
          <div class="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <List class="w-5 h-5 text-blue-600" />
              使用步骤
            </h3>
            <ol class="list-decimal list-inside text-gray-700 space-y-3">
              <li class="flex items-start gap-2">
                <span class="mt-1">1、找到对应的技能，得到 git 地址，将技能克隆到本地文件夹，</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="mt-1">2、打开 CodeBuddy IDE 工具，</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="mt-1">3、在设置中找到“技能”，将文件夹导入到个人/项目技能中，</span>
              </li>
            </ol>
          </div>
          
          
        </div>
      </section>

      
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Sparkles, 
  Lightbulb, 
  Bot, 
  ExternalLink, 
  List, 
  Code, 
  Copy, 
  FileCode, 
  BookOpen, 
  AlertTriangle,
  HelpCircle
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
</script>