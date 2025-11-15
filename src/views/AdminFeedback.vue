<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
      <h2 class="text-xl font-semibold leading-tight text-gray-900">用户反馈</h2>
      <div class="flex flex-col sm:flex-row gap-2">
        <!-- 搜索框，与分类管理一致尺寸样式 -->
        <div class="relative">
          <input
            v-model="search"
            @keyup.enter="reload"
            type="text"
            placeholder="搜索意见内容"
            class="pl-9 pr-8 py-1.5 w-full sm:w-56 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            v-select-all-shortcut
          />
          <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            v-if="search"
            type="button"
            @click="clearSearch"
            class="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600"
            title="清除"
            aria-label="清除"
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <!-- 类型筛选（对齐尺寸） -->
        <select
          v-model="type"
          class="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="">全部类型</option>
          <option value="skill">技能</option>
        </select>

        <!-- 刷新按钮（与分类管理一致） -->
        <button
          type="button"
          @click="reload"
          title="刷新"
          aria-label="刷新"
          class="bg-gray-100 text-gray-800 px-3 py-1.5 text-sm rounded-md hover:bg-gray-200 transition-colors inline-flex items-center justify-center"
        >
          <RefreshCw class="h-4 w-4" />
        </button>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">来源ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">问题标签</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">其他意见</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="loading">
            <td colspan="6" class="px-6 py-8 text-center">
              <div class="inline-flex items-center gap-2">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                <span class="text-gray-600">加载中...</span>
              </div>
            </td>
          </tr>
          <tr v-else-if="items.length === 0">
            <td colspan="6" class="px-6 py-12 text-center">
              <div class="text-gray-400">
                <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h8m-8 4h6" />
                </svg>
                <p class="mt-2 text-sm">暂无反馈</p>
              </div>
            </td>
          </tr>
          <tr v-for="fb in items" :key="fb.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ fb.type }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ fb.source_id }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              <div class="flex flex-wrap gap-1">
                <span v-for="tag in (fb.issues || [])" :key="tag" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{{ tag }}</span>
              </div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-900">
              <div class="max-w-xs truncate" :title="fb.comment">{{ fb.comment || '—' }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ fb.user_id }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatTime(fb.created_at) }}</td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>

    <div v-if="totalPages > 1" class="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
      <div class="flex-1 flex justify-between sm:hidden">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage <= 1 || loading"
          class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          上一页
        </button>
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage >= totalPages || loading"
          class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          下一页
        </button>
      </div>
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            显示第 <span class="font-medium">{{ (currentPage - 1) * limit + 1 }}</span> 到 <span class="font-medium">{{ Math.min(currentPage * limit, total) }}</span> 条，
            共 <span class="font-medium">{{ total }}</span> 条记录
          </p>
        </div>
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage <= 1 || loading"
              class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="sr-only">上一页</span>
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </button>
            <button
              v-for="pageNum in visiblePages"
              :key="pageNum"
              @click="goToPage(pageNum)"
              :class="[
                currentPage === pageNum 
                  ? 'z-10 bg-orange-50 border-orange-500 text-orange-600' 
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
              ]"
            >
              {{ pageNum }}
            </button>
            <button
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage >= totalPages || loading"
              class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="sr-only">下一页</span>
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>
  </template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
import { RefreshCw, X } from 'lucide-vue-next'

interface FeedbackItem {
  id: string
  type: string
  source_id: string
  user_id: string
  issues: string[]
  comment: string
  created_at: string
}

const router = useRouter()
const items = ref<FeedbackItem[]>([])
const loading = ref(false)
const currentPage = ref(1)
const limit = ref(20)
const total = ref(0)
const type = ref('')
const search = ref('')

const totalPages = computed(() => Math.max(Math.ceil(total.value / limit.value), 1))
const visiblePages = computed(() => {
  const pages: number[] = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const formatTime = (t: string) => dayjs(t).format('YYYY-MM-DD HH:mm')

const reload = async (): Promise<void> => {
  loading.value = true
  try {
    const token = localStorage.getItem('admin_token')
    const params = new URLSearchParams({ page: String(currentPage.value), limit: String(limit.value) })
    if (type.value) params.set('type', type.value)
    if (search.value) params.set('q', search.value)
    const res = await fetch(`/api/admin/feedback?${params.toString()}`, {
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('admin_token')
        router.push('/admin/login')
        return
      }
      throw new Error(`加载失败 (${res.status})`)
    }
    const data = await res.json()
    items.value = Array.isArray(data.items) ? data.items : []
    total.value = typeof data.total === 'number' ? data.total : (items.value.length || 0)
    limit.value = typeof data.pageSize === 'number' ? data.pageSize : limit.value
    currentPage.value = typeof data.page === 'number' ? data.page : currentPage.value
  } catch (err) {
    console.error('加载反馈失败:', err)
    items.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const clearSearch = (): void => {
  if (!search.value) return
  search.value = ''
  currentPage.value = 1
  reload()
}

const goToPage = (pageNum: number): void => {
  if (pageNum >= 1 && pageNum <= totalPages.value) {
    currentPage.value = pageNum
    reload()
  }
}

onMounted(() => { reload() })
</script>

<style scoped>
</style>