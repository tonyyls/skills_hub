<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-900 mb-6">管理概览</h2>
    
    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white p-6 rounded-lg shadow-sm border">
        <div class="flex items-center">
          <div class="p-2 bg-orange-100 rounded-lg">
            <svg class="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">分类总数</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.categories }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-sm border">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">技能总数</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.skills }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-sm border">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">已发布技能</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.publishedSkills }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-sm border">
        <div class="flex items-center">
          <div class="p-2 bg-purple-100 rounded-lg">
            <svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">总浏览量</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.totalViews }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const stats = ref({
  categories: 0,
  skills: 0,
  publishedSkills: 0,
  totalViews: 0
})
const router = useRouter()

/**
 * 加载管理概览统计数据。
 * - 分类总数：`GET /api/admin/categories`，取 `items.length`
 * - 技能总数：`GET /api/admin/skills?page=1&limit=1`，取 `total`
 * - 已发布技能：`GET /api/admin/skills?page=1&limit=1&status=published`，取 `total`
 * - 总浏览量：暂设为 `0`
 * - 处理401：清除令牌并跳转登录
 * - 网络中断进行一次重试，提升稳定性
 */
const loadDashboardData = async (): Promise<void> => {
  const token = localStorage.getItem('admin_token')

  /**
   * 执行带鉴权的 `fetch` 请求，失败时重试一次。
   * @param url - 请求地址
   * @returns 成功时返回 `Response` 对象
   */
  const doFetch = async (url: string): Promise<Response> => {
    const headers: Record<string, string> = { 'Accept': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    const attempt = async () => fetch(url, { headers })
    try {
      return await attempt()
    } catch (e) {
      // 网络中断重试一次
      await new Promise(r => setTimeout(r, 300))
      return await attempt()
    }
  }

  try {
    // 分类总数
    const catRes = await doFetch('/api/admin/categories')
    if (catRes.status === 401) {
      localStorage.removeItem('admin_token')
      router.push('/admin/login')
      return
    }
    const catData = await catRes.json().catch(() => ({ items: [] }))
    const categories = Array.isArray(catData.items) ? catData.items.length : 0

    // 技能总数（最小查询集）
    const skillsRes = await doFetch('/api/admin/skills?page=1&limit=1')
    if (skillsRes.status === 401) {
      localStorage.removeItem('admin_token')
      router.push('/admin/login')
      return
    }
    const skillsData = await skillsRes.json().catch(() => ({ total: 0 }))
    const skills = typeof skillsData.total === 'number' ? skillsData.total : 0

    // 已发布技能总数
    const pubRes = await doFetch('/api/admin/skills?page=1&limit=1&status=published')
    if (pubRes.status === 401) {
      localStorage.removeItem('admin_token')
      router.push('/admin/login')
      return
    }
    const pubData = await pubRes.json().catch(() => ({ total: 0 }))
    const publishedSkills = typeof pubData.total === 'number' ? pubData.total : 0

    stats.value = {
      categories,
      skills,
      publishedSkills,
      totalViews: 0
    }
  } catch (error) {
    console.error('加载仪表板数据失败:', error)
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>