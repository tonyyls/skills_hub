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
              <Sparkles class="w-6 h-6 text-orange-600" /> {{ t('pages.tutorial.title') }}
            </h1>
            <p class="text-gray-700 mt-2">
              {{ t('pages.tutorial.intro') }}
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
            <h2 class="text-xl md:text-2xl font-bold text-gray-900">{{ t('pages.tutorial.claudeTitle') }}</h2>
          </div>
          
        </header>
        <p class="text-gray-700 mb-6 text-lg leading-relaxed">{{ t('pages.tutorial.claudeIntro') }}</p>
        <div class="space-y-6">
          <div class="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <List class="w-5 h-5 text-orange-600" />
              {{ t('pages.tutorial.stepsTitle') }}
            </h3>
            <ol class="list-decimal list-inside text-gray-700 space-y-3">
              <li class="flex items-start gap-2">
                <span class="mt-1">1. {{ t('pages.tutorial.claudeStep1') }}</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="mt-1">2. {{ t('pages.tutorial.claudeStep2') }}</span>
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
            <h2 class="text-xl md:text-2xl font-bold text-gray-900">{{ t('pages.tutorial.codebuddyTitle') }}</h2>
          </div>
          
        </header>
        <p class="text-gray-700 mb-6 text-lg leading-relaxed">{{ t('pages.tutorial.codebuddyIntro') }}</p>
        <div class="space-y-4">
          <div class="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <List class="w-5 h-5 text-blue-600" />
              {{ t('pages.tutorial.stepsTitle') }}
            </h3>
            <ol class="list-decimal list-inside text-gray-700 space-y-3">
              <li class="flex items-start gap-2">
                <span class="mt-1">1. {{ t('pages.tutorial.codebuddyStep1') }}</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="mt-1">2. {{ t('pages.tutorial.codebuddyStep2') }}</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="mt-1">3. {{ t('pages.tutorial.codebuddyStep3') }}</span>
              </li>
            </ol>
          </div>
          
          
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
const { t } = useI18n()
</script>