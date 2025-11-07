/**
 * 关于我们页面
 * 展示平台信息和团队介绍
 */
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 页面头部 -->
    <div class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center">
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">关于我们</h1>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Skills Hub 是一个技能分享平台，致力于连接技能拥有者和学习者
          </p>
        </div>
      </div>
    </div>

    <!-- 主要内容 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- 平台介绍 -->
      <div class="bg-white rounded-lg shadow-sm p-8 mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">我们的使命</h2>
        <div class="prose max-w-none text-gray-700">
          <p class="mb-4">
            Skills Hub 诞生于一个简单的想法：让技能分享变得更加容易和高效。在这个快速发展的时代，
            每个人都有独特的技能和知识，我们希望通过这个平台，让技能拥有者能够轻松地分享他们的经验，
            同时也让学习者能够快速找到他们需要的资源。
          </p>
          <p class="mb-4">
            我们相信，知识的分享不应该受到地域、时间或经济条件的限制。通过 Skills Hub，
            任何人都可以成为老师，任何人也都可以成为学生。我们致力于打造一个开放、包容、
            高质量的技能分享社区。
          </p>
        </div>
      </div>

      <!-- 核心功能 -->
      <div class="bg-white rounded-lg shadow-sm p-8 mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">核心功能</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex items-start space-x-4">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Upload class="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">技能发布</h3>
              <p class="text-gray-600">轻松发布你的技能资源，支持多种文件格式，让分享变得简单。</p>
            </div>
          </div>
          <div class="flex items-start space-x-4">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Search class="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">智能搜索</h3>
              <p class="text-gray-600">强大的搜索功能，帮助你快速找到需要的技能资源。</p>
            </div>
          </div>
          <div class="flex items-start space-x-4">
            <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Star class="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">评分系统</h3>
              <p class="text-gray-600">通过评分系统，确保资源质量，帮助用户做出更好的选择。</p>
            </div>
          </div>
          <div class="flex items-start space-x-4">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users class="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">社区互动</h3>
              <p class="text-gray-600">与其他用户互动，分享经验，共同成长。</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 联系我们 -->
      <div class="bg-white rounded-lg shadow-sm p-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">联系我们</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">反馈和建议</h3>
            <p class="text-gray-600 mb-4">
              如果您有任何建议或发现了问题，欢迎通过以下方式联系我们：
            </p>
            <div class="space-y-2">
              <div class="flex items-center space-x-2">
                <Mail class="w-4 h-4 text-gray-500" />
                <span class="text-gray-600">feedback@skillshub.com</span>
              </div>
              <div class="flex items-center space-x-2">
                <Github class="w-4 h-4 text-gray-500" />
                <span class="text-gray-600">github.com/skillshub</span>
              </div>
            </div>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">技术支持</h3>
            <p class="text-gray-600 mb-4">
              如果您在使用平台时遇到技术问题，我们的技术团队随时为您提供帮助。
            </p>
            <div class="space-y-2">
              <div class="flex items-center space-x-2">
                <HelpCircle class="w-4 h-4 text-gray-500" />
                <span class="text-gray-600">support@skillshub.com</span>
              </div>
              <div class="flex items-center space-x-2">
                <Clock class="w-4 h-4 text-gray-500" />
                <span class="text-gray-600">工作日 9:00-18:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Upload, Search, Star, Users, Mail, Github, HelpCircle, Clock } from 'lucide-vue-next'
</script>