/**
 * 使用教程页面
 * 展示平台使用指南和操作说明
 */
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 页面头部 -->
    <div class="bg-white shadow-sm">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center">
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">使用教程</h1>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            了解如何使用 Skills Hub，从注册到发布技能，一步步掌握平台功能
          </p>
        </div>
      </div>
    </div>

    <!-- 主要内容 -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- 快速开始 -->
      <div class="bg-white rounded-lg shadow-sm p-8 mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">快速开始</h2>
        <div class="space-y-6">
          <div class="flex items-start space-x-4">
            <div class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
              1
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">注册账户</h3>
              <p class="text-gray-600 mb-3">
                点击右上角的 "登录" 按钮，使用 GitHub 账户快速注册和登录。
                我们支持 GitHub OAuth 认证，确保账户安全。
              </p>
              <div class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <p class="text-blue-800 text-sm">
                  <strong>提示：</strong> 确保你的 GitHub 账户信息完整，
                  这样其他用户才能更好地了解你。
                </p>
              </div>
            </div>
          </div>
          
          <div class="flex items-start space-x-4">
            <div class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
              2
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">浏览技能</h3>
              <p class="text-gray-600 mb-3">
                在首页或技能页面浏览各种技能资源。你可以通过分类、标签或搜索功能
                快速找到感兴趣的内容。
              </p>
              <ul class="list-disc list-inside text-gray-600 space-y-1">
                <li>使用搜索框输入关键词</li>
                <li>按分类筛选技能</li>
                <li>查看热门标签</li>
                <li>按下载量或评分排序</li>
              </ul>
            </div>
          </div>
          
          <div class="flex items-start space-x-4">
            <div class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
              3
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">下载技能</h3>
              <p class="text-gray-600 mb-3">
                找到感兴趣的技能后，点击 "下载资源" 按钮即可下载。
                部分资源可能需要登录后才能下载。
              </p>
              <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <p class="text-yellow-800 text-sm">
                  <strong>注意：</strong> 请尊重创作者的劳动成果，
                  合理使用下载的资源。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 发布技能 -->
      <div class="bg-white rounded-lg shadow-sm p-8 mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">发布技能</h2>
        <div class="space-y-6">
          <div class="flex items-start space-x-4">
            <div class="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
              1
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">准备技能文件</h3>
              <p class="text-gray-600 mb-3">
                准备好你要分享的技能文件。我们支持多种格式：
              </p>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-gray-50 p-3 rounded-lg text-center">
                  <FileText class="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p class="text-sm font-medium">PDF</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-lg text-center">
                  <Archive class="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p class="text-sm font-medium">ZIP</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-lg text-center">
                  <File class="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p class="text-sm font-medium">DOC</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-lg text-center">
                  <File class="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p class="text-sm font-medium">DOCX</p>
                </div>
              </div>
              <div class="bg-red-50 border-l-4 border-red-400 p-4 rounded mt-4">
                <p class="text-red-800 text-sm">
                  <strong>限制：</strong> 文件大小不能超过 10MB。
                </p>
              </div>
            </div>
          </div>
          
          <div class="flex items-start space-x-4">
            <div class="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
              2
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">填写技能信息</h3>
              <p class="text-gray-600 mb-3">
                在发布页面填写详细的技能信息：
              </p>
              <ul class="list-disc list-inside text-gray-600 space-y-2">
                <li>
                  <strong>技能标题：</strong> 简洁明了地描述你的技能
                  <div class="text-sm text-gray-500 mt-1">例如："Vue.js 组件开发最佳实践"</div>
                </li>
                <li>
                  <strong>技能分类：</strong> 选择最合适的分类
                  <div class="text-sm text-gray-500 mt-1">这有助于用户找到你的技能</div>
                </li>
                <li>
                  <strong>技能描述：</strong> 详细描述技能内容
                  <div class="text-sm text-gray-500 mt-1">让用户了解技能的价值和用途</div>
                </li>
                <li>
                  <strong>标签：</strong> 添加相关标签
                  <div class="text-sm text-gray-500 mt-1">帮助用户通过搜索找到你的技能</div>
                </li>
              </ul>
            </div>
          </div>
          
          <div class="flex items-start space-x-4">
            <div class="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
              3
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">发布技能</h3>
              <p class="text-gray-600 mb-3">
                检查所有信息无误后，点击 "发布技能" 按钮。
                发布后，其他用户就可以浏览和下载你的技能了。
              </p>
              <div class="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                <p class="text-green-800 text-sm">
                  <strong>成功提示：</strong> 技能发布后，你可以在个人资料页面
                  查看和管理你发布的所有技能。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 常见问题 -->
      <div class="bg-white rounded-lg shadow-sm p-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">常见问题</h2>
        <div class="space-y-6">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Q: 发布技能需要付费吗？</h3>
            <p class="text-gray-600">
              A: 目前平台完全免费，发布和下载技能都不需要任何费用。
              我们希望通过免费的方式鼓励更多人分享知识。
            </p>
          </div>
          
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Q: 如何确保技能质量？</h3>
            <p class="text-gray-600">
              A: 我们通过用户评分系统来确保技能质量。每个用户都可以对下载的技能进行评分，
              评分高的技能会获得更多的曝光机会。
            </p>
          </div>
          
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Q: 可以修改已发布的技能吗？</h3>
            <p class="text-gray-600">
              A: 是的，你可以在个人资料页面查看和管理你发布的所有技能，
              包括编辑技能信息和删除技能。
            </p>
          </div>
          
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Q: 支持哪些文件格式？</h3>
            <p class="text-gray-600">
              A: 目前支持 PDF、ZIP、DOC、DOCX 格式。ZIP 格式适合包含多个文件的技能资源，
              PDF 适合文档类内容，DOC/DOCX 适合需要编辑的文档。
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FileText, Archive, File, Upload, Search, Star, Users, HelpCircle } from 'lucide-vue-next'
</script>