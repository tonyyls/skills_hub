<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="bg-white rounded-lg shadow-sm p-6 w-full max-w-md">
      <div class="flex items-center space-x-3 mb-4">
        <svg class="w-6 h-6 text-blue-600 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <h1 class="text-lg font-semibold text-gray-900">正在处理登录回调...</h1>
      </div>
      <p class="text-sm text-gray-600" v-if="!error">请稍候，正在确认会话并跳转</p>
      <div v-else class="bg-red-50 border border-red-200 rounded-md p-3 mt-2">
        <p class="text-sm text-red-700">{{ error }}</p>
      </div>
      <div class="mt-4 flex gap-2" v-if="error">
        <router-link to="/" class="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">返回首页</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const route = useRoute()
const error = ref<string | null>(null)

/**
 * 处理 Supabase OAuth 回调并完成跳转。
 * - 读取 Supabase 会话（`detectSessionInUrl` 已启用，会自动解析）
 * - 优先使用 `localStorage.redirect_after_login` 作为重定向目标
 * - 其次使用 `?redirect=` 查询参数
 * - 默认跳转到首页 `/`
 */
const handleCallback = async (): Promise<void> => {
  try {
    // 等待并确认 Supabase 已建立会话
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw sessionError
    if (!session) {
      // 有时需要一点延时等待 onAuthStateChange 完成持久化
      await new Promise((resolve) => setTimeout(resolve, 300))
    }

    // 解析重定向目标
    const saved = localStorage.getItem('redirect_after_login')
    const fromQuery = typeof route.query.redirect === 'string' ? route.query.redirect : null
    const target = saved || fromQuery || '/'

    // 使用后清理 localStorage
    if (saved) localStorage.removeItem('redirect_after_login')

    // 跳转到目标页面
    router.replace(target)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '登录回调处理失败'
    console.error('Auth callback error:', e)
  }
}

onMounted(() => {
  document.title = '登录回调 - Skills Hub'
  void handleCallback()
})
</script>

<style scoped>
/* 保持页面简洁，无额外样式 */
</style>