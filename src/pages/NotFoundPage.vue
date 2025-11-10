/**
 * 404页面
 * 当用户访问不存在的页面时显示
 */
<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="text-center">
      <!-- 404图标 -->
      <div class="mb-8">
        <div class="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle class="w-16 h-16 text-blue-600" />
        </div>
      </div>
      
      <!-- 错误信息 -->
      <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-4">404</h1>
      <h2 class="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">页面未找到</h2>
      <p class="text-lg text-gray-600 mb-8 max-w-md mx-auto">
        抱歉，您访问的页面不存在或已被移动。请检查URL是否正确，或返回首页继续浏览。
      </p>
      
      <!-- 操作按钮 -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          @click="goHome"
          class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
        >
          返回首页
        </button>
        <button
          @click="goBack"
          class="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
        >
          返回上一页
        </button>
      </div>
      
      <!-- 搜索建议 -->
      <div class="mt-12 max-w-md mx-auto">
        <p class="text-sm text-gray-600 mb-4">或者搜索你感兴趣的内容：</p>
        <div class="relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            v-model="searchQuery"
            @keyup.enter="performSearch"
            type="text"
            placeholder="搜索技能..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { AlertTriangle, Search } from 'lucide-vue-next'

const router = useRouter()
const searchQuery = ref('')

/**
 * 返回首页
 */
const goHome = () => {
  router.push('/')
}

/**
 * 返回上一页
 */
const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}

/**
 * 执行搜索
 */
const performSearch = () => {
  if (searchQuery.value.trim()) {
    router.push(`/search?q=${encodeURIComponent(searchQuery.value)}`)
  }
}
</script>