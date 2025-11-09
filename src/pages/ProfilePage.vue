<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 封面背景（橙白主题，与站点统一） -->
    <div class="relative">
      <div
        class="h-40 md:h-56"
        style="background: linear-gradient(135deg, var(--brand-orange-start), var(--brand-orange-end));"
      ></div>
      <!-- 向下白色渐隐，降低视觉重量 -->
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-white/70"></div>
    </div>

    <div class="max-w-4xl mx-auto px-4 -mt-16 md:-mt-20">
      <!-- 加载中骨架屏 -->
      <div v-if="loading" class="bg-white/90 backdrop-blur rounded-xl shadow p-6 md:p-8">
        <!-- 顶部头像与基本信息骨架 -->
        <div class="flex flex-col md:flex-row md:items-center gap-6 animate-pulse">
          <div class="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gray-200"></div>
          <div class="flex-1 space-y-3">
            <div class="h-6 w-40 bg-gray-200 rounded"></div>
            <div class="h-4 w-64 bg-gray-200 rounded"></div>
            <div class="flex items-center gap-3 mt-2">
              <div class="h-4 w-28 bg-gray-200 rounded"></div>
              <div class="h-4 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>

        <!-- 统计信息骨架 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div class="rounded-lg border border-gray-200 p-4">
            <div class="h-4 w-24 bg-gray-200 rounded mb-3 animate-pulse"></div>
            <div class="h-6 w-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div class="rounded-lg border border-gray-200 p-4">
            <div class="h-4 w-24 bg-gray-200 rounded mb-3 animate-pulse"></div>
            <div class="h-6 w-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div class="rounded-lg border border-gray-200 p-4">
            <div class="h-4 w-24 bg-gray-200 rounded mb-3 animate-pulse"></div>
            <div class="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      <!-- 用户资料卡片 -->
      <div v-else-if="profile" class="bg-white/90 backdrop-blur rounded-xl shadow-lg p-6 md:p-8">
        <!-- 顶部头像与基本信息 -->
        <div class="flex flex-col md:flex-row md:items-center gap-6">
          <img
            :src="avatarUrl"
            class="w-28 h-28 md:w-32 md:h-32 rounded-full ring-4 ring-white shadow-lg object-cover"
            alt="avatar"
          />

          <div class="flex-1">
            <h1 class="text-xl md:text-2xl font-bold text-gray-900">{{ displayName }}</h1>
            <p class="text-gray-600 mt-1">发现社区中优质的 Skills 资源，提升你的AI使用效率</p>
            <div class="flex flex-wrap items-center gap-3 mt-3 text-sm">
              <a v-if="profileEmail" :href="`mailto:${profileEmail}`" class="inline-flex items-center gap-1 text-gray-700 hover:text-blue-600">
                <Mail class="w-4 h-4" />
                <span>{{ profileEmail }}</span>
              </a>
              <!-- GitHub 链接：展示为用户名或域名，点击跳转 -->
              <!-- GitHub 链接区域：有值则可点击，无值显示“暂无” -->
              <div class="inline-flex items-center gap-1 text-gray-700">
                <Github class="w-4 h-4" />
                <a
                  v-if="profileGithub"
                  :href="normalizedGithubUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="hover:text-orange-600"
                >
                  {{ githubDisplayText }}
                </a>
                <span v-else class="text-gray-400">暂无</span>
              </div>
          </div>
        </div>
        </div>

        <!-- 统计信息 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div class="rounded-lg border border-gray-200 p-4 bg-gradient-to-br from-white to-gray-50">
            <p class="text-sm text-gray-600">发布技能</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.skillsCount }}</p>
          </div>
          <div class="rounded-lg border border-gray-200 p-4 bg-gradient-to-br from-white to-gray-50">
            <p class="text-sm text-gray-600">总下载量</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.totalDownloads }}</p>
          </div>
          <div class="rounded-lg border border-gray-200 p-4 bg-gradient-to-br from-white to-gray-50">
            <p class="text-sm text-gray-600">加入时间</p>
            <p class="text-lg font-bold text-gray-900 inline-flex items-center gap-2">
              <CalendarDays class="w-5 h-5 text-gray-700" /> {{ memberSince }}
            </p>
          </div>
        </div>

        <!-- 快捷入口：我的收藏 -->
        <div class="mt-6">
          <router-link
            to="/profile/skills"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors"
          >
            查看我的收藏
          </router-link>
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-else class="bg-white/90 backdrop-blur rounded-xl shadow p-6 text-center text-red-600">
        加载失败，请稍后重试
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'
import { Github, Mail, CalendarDays, PencilLine } from 'lucide-vue-next'

interface Profile {
  username: string | null
  avatar_url: string | null
  bio: string | null
  github_url: string | null
}

const auth = useAuthStore()
const profile = ref<Profile | null>(null)
const loading = ref(true)
const stats = ref({ skillsCount: 0, totalDownloads: 0 })

/**
 * 加载个人资料。
 * - 若为普通用户（Supabase 会话），从 `users` 表读取资料。
 * - 若为管理员登录（本地 adminUser），用管理员信息填充基本资料。
 * - 若两者皆无，则结束加载并显示错误区块。
 * @returns {Promise<void>} 加载完成后更新 `profile` 与 `loading`。
 */
const loadProfile = async (): Promise<void> => {
  loading.value = true
  try {
    const userId = auth.user?.id
    if (!userId) {
      // 管理员登录时显示管理员的基本信息
      if (auth.adminUser) {
        profile.value = {
          username: auth.adminUser.username,
          avatar_url: null,
          bio: null
        }
      }
      return
    }

    const { data, error } = await supabase
      .from('users')
      .select('username, avatar_url, bio, github_url')
      .eq('id', userId)
      .single()

    if (error || !data) {
      console.error('Load profile error:', error)
      // 若查询不到记录，使用会话信息填充基础资料，避免页面空白
      profile.value = {
        username: auth.user?.username ?? null,
        avatar_url: auth.user?.avatar_url ?? null,
        bio: null,
        github_url: auth.user?.github_url ?? null
      }
    } else {
      profile.value = data
    }
  } finally {
    loading.value = false
  }
}

/**
 * 加载统计信息：查询当前用户发布技能数量与总下载量。
 * - 优先从 Supabase `skills` 表按 `user_id` 聚合。
 * - 兼容字段名 `download_count` 与历史 `downloads`。
 * @returns {Promise<void>} 更新 `stats`。
 */
const loadStats = async (): Promise<void> => {
  stats.value = { skillsCount: 0, totalDownloads: 0 }
  const userId = auth.user?.id
  if (!userId) return
  try {
    const { data, error, count } = await supabase
      .from('skills')
      .select('id, download_count, downloads', { count: 'exact' })
      .eq('user_id', userId)

    if (error) throw error
    const totalDownloads = (data || []).reduce((sum: number, item: any) => {
      const d = typeof item.download_count === 'number' ? item.download_count : (item.downloads || 0)
      return sum + d
    }, 0)
    stats.value = { skillsCount: count || (data?.length || 0), totalDownloads }
  } catch (e) {
    console.warn('加载统计失败：', e)
  }
}

/**
 * 计算显示名称。
 * @returns {string} 显示的用户名或占位文本。
 */
const displayName = computed(() => profile.value?.username || auth.user?.username || '未设置昵称')

/**
 * 计算头像 URL。
 * @returns {string} 头像链接或占位图。
 */
const avatarUrl = computed(() => profile.value?.avatar_url || auth.user?.avatar_url || '/logo.png')

/**
 * 计算简介文本。
 * @returns {string} 简介或占位文本。
 */
const bioText = computed(() => profile.value?.bio || '暂无简介')

/**
 * 邮箱与 GitHub 原始链接。
 * @returns {string|null} 邮箱；GitHub 原始链接（可能为用户名或路径）。
*/
const profileEmail = computed(() => auth.user?.email || null)
const profileGithub = computed(() => profile.value?.github_url || auth.user?.github_url || null)

/**
 * 规范化 GitHub 链接。
 * - 支持直接填写用户名（如 `tonyyls`）或路径（如 `github.com/tonyyls`）。
 * - 统一补全为 `https://github.com/<username>` 或 `https://...`。
 * @returns {string|null} 可直接跳转的完整链接。
 */
const normalizedGithubUrl = computed(() => {
  const raw = profileGithub.value?.trim()
  if (!raw) return null
  // 已包含协议
  if (/^https?:\/\//i.test(raw)) return raw
  // 以 github.com 开头的路径
  if (/^github\.com\//i.test(raw)) return `https://${raw}`
  // 纯用户名（字母数字、下划线、连字符）
  if (/^[A-Za-z0-9_-]+$/i.test(raw)) return `https://github.com/${raw}`
  // 其他情况，尽量补全协议
  return `https://${raw}`
})

/**
 * GitHub 展示文本。
 * - 对 github.com 域名展示为 `github.com/<path>`；其他域名展示主机名。
 * @returns {string} 显示给用户的简短地址。
 */
const githubDisplayText = computed(() => {
  const url = normalizedGithubUrl.value
  if (!url) return ''
  try {
    const u = new URL(url)
    if (u.hostname.includes('github.com')) {
      const path = u.pathname.replace(/^\//, '')
      return path ? `github.com/${path}` : 'github.com'
    }
    return u.hostname
  } catch {
    return url
  }
})

/**
 * 成员加入时间格式化。
 * @returns {string} 形如 YYYY/MM/DD HH:MM 的日期时间或原始字符串。
 */
const memberSince = computed(() => {
  const ts = auth.user?.created_at || auth.adminUser?.created_at || ''
  if (!ts) return '未知'
  try {
    return new Date(ts).toLocaleString('zh-CN')
  } catch {
    return ts
  }
})

/**
 * 原编辑资料功能暂时下线，后续可能重新启用。
 * 保留 PencilLine 图标导入以便未来复用。
 */

onMounted(() => {
  void loadProfile()
  void loadStats()
})

watch(
  () => [auth.user, auth.adminUser],
  () => {
    void loadProfile()
    void loadStats()
  }
)
</script>