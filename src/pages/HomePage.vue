<template>
  <div class="min-h-screen bg-[#F7F3EF]">

    <!-- 轻量提示：登录引导，与 /skills 保持一致 -->
    <div
      v-if="showToast"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg shadow z-50"
    >
      {{ loginToast }}
    </div>

    <!-- 收藏确认弹层：与 /skills 保持一致 -->
    <div
      v-if="showFavoriteConfirm"
      class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      @click.self="cancelFavorite"
    >
      <div class="bg-white rounded-lg shadow p-5 w-full max-w-sm">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">加入收藏</h3>
        <p class="text-gray-600 mb-4">是否将该技能加入收藏？</p>
        <div class="flex justify-end gap-2">
          <button class="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200" @click="cancelFavorite">取消</button>
          <button class="px-3 py-1.5 text-sm rounded-md bg-orange-600 text-white hover:bg-orange-700 transition-colors duration-200" @click="confirmFavorite">确认</button>
        </div>
      </div>
    </div>

    <div class="relative z-10">
      <!-- 顶部 Banner（统一为首页风格：深色背景 + 渐变强调） -->
      <section class="relative py-16 lg:py-20 overflow-hidden">
        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold text-[#333] mb-6 leading-tight">
  发现优秀的 Skills 技能资源
          </h1>
          <p class="text-lg md:text-xl text-[#666] mb-10 max-w-3xl mx-auto leading-relaxed">
            Skills Hub 是一个第三方技能市场，共收录了 {{ totalSkills }} 个技能。
          </p>

          <!-- 搜索框：与首页一致的现代化样式 -->
          <div class="max-w-2xl mx-auto">
            <div class="relative">
              <div class="relative bg-white rounded-full p-1">
                <div class="flex items-center">
                  <Search class="w-5 h-5 text-gray-400 ml-4" />
                  <input
                    v-model="searchQuery"
                    @keyup.enter="handleSearch"
                    type="text"
                    placeholder="关键字搜索技能..."
                    class="flex-1 bg-transparent border-none outline-none appearance-none focus:outline-none focus-visible:outline-none focus:border-transparent focus-visible:border-transparent focus:ring-0 focus-visible:ring-0 px-4 py-3 text-gray-800 placeholder-[#9AA0A6] text-base md:text-lg"
                  />
                  <!-- 清除输入按钮：仅在有内容时显示 -->
                  <button
                    v-if="searchQuery"
                    @click="clearSearchInput"
                    type="button"
                    class="ml-2 mr-2 rounded-full p-1 text-gray-400 hover:text-[#FF7A45] transition-colors"
                    aria-label="清除搜索"
                    title="清除"
                  >
                    <XCircle class="w-4 h-4" />
                  </button>
                  <button
                    @click="handleSearch"
                    class="bg-gradient-to-r from-[#FF6A3A] to-[#FF7A45] text-white px-5 py-2 rounded-full font-semibold hover:shadow-md transition-all duration-300 mr-1"
                  >
                    搜索
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      

      

      <!-- 内容区域 -->
      <div class="max-w-7xl mx-auto px-4 pb-16">
        <!-- 区域标题 -->
        <div class="flex justify-between items-center mb-8">
          <h2 class="text-2xl font-semibold text-[#444]">{{ sectionTitle }}</h2>
          <div class="flex items-center gap-3">
            <button
              v-for="filter in filters"
              :key="filter.value"
              @click="activeFilter = filter.value"
              :class="[
                'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                activeFilter === filter.value
                  ? 'bg-gradient-to-r from-[#FF6A3A] to-[#FF7A45] text-white shadow-sm'
                  : 'bg-white text-[#555] border border-[#E5E5E5] hover:bg-[#FFF5EF] hover:text-[#333]'
              ]"
            >
              <component :is="filter.icon" class="h-4 w-4 inline mr-2" v-if="filter.icon" />
              {{ filter.label }}
            </button>
          </div>
          <router-link
            to="/skills"
            class="text-[#FF7A45] hover:text-[#ff8a55] transition-colors flex items-center gap-1"
          >
            查看全部
            <ChevronRight class="h-4 w-4" />
          </router-link>
        </div>

        <!-- 骨架屏：加载中展示 3 行（xl 下共 12 张卡片） -->
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div v-for="i in 12" :key="i" class="bg-white border border-[#EEEEEE] rounded-xl p-6 animate-pulse flex flex-col gap-4">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="h-5 bg-gray-200 rounded w-3/4"></div>
                <div class="mt-2 h-4 bg-gray-200 rounded w-20"></div>
              </div>
              <div class="h-5 w-5 bg-gray-200 rounded-full"></div>
            </div>
            <div class="space-y-2">
              <div class="h-4 bg-gray-200 rounded w-full"></div>
              <div class="h-4 bg-gray-200 rounded w-11/12"></div>
              <div class="h-4 bg-gray-200 rounded w-10/12"></div>
              <div class="h-4 bg-gray-200 rounded w-9/12"></div>
            </div>
            <div class="mt-auto flex items-center justify-between">
              <div class="h-4 bg-gray-200 rounded w-24"></div>
              <div class="h-5 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>

        <!-- 技能卡片网格 -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div
            v-for="skill in filteredSkills"
            :key="skill.id"
            class="group bg-white border border-[#EEEEEE] rounded-xl p-6 hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col"
            @click="goToSkillDetail(skill.id)"
          >
            <!-- 卡片头部 -->
            <div class="flex justify-between items-start mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <!-- 精选徽章：featured 或包含“精选”标签均显示 -->
                  <span
                    v-if="skill.featured || (Array.isArray(skill.tags) && skill.tags.includes('精选'))"
                    class="inline-block px-2 py-1 bg-gradient-to-r from-[#FF7A45] to-[#FF6A3A] text-white text-xs rounded-full"
                  >
                    精选
                  </span>
                  <h3 class="font-semibold text-gray-800 group-hover:text-[#FF7A45] transition-colors line-clamp-2">
                    {{ skill.title }}
                  </h3>
                </div>
              </div>
              <!-- 收藏星标 -->
              <button
                @click.stop="handleFavorite(skill)"
                class="text-gray-400 hover:text-yellow-400 transition-colors ml-2"
              >
                <Star
                  :class="[
                    'h-5 w-5',
                    favorites.includes(skill.id) ? 'text-yellow-400 fill-current' : ''
                  ]"
                />
              </button>
            </div>

            <!-- 描述 -->
            <p class="text-gray-600 text-sm line-clamp-3 mb-4">
              {{ skill.description }}
            </p>

            <!-- 标签 -->
            <div class="flex flex-wrap gap-2 mb-4">
              <span
                v-for="tag in skill.tags.slice(0, 3)"
                :key="tag"
                class="px-2 py-1 bg-[#F4F4F4] text-[#666] text-xs rounded-full"
              >
                {{ tag }}
              </span>
            </div>

            <!-- 底部信息：左分类、右作者（无作者显示“官方”），置底显示 -->
            <div class="mt-auto flex items-center justify-between text-gray-500 text-sm">
              <span>{{ getCategoryName(skill.category_id) || '未分类' }}</span>
              <span v-if="(skill.author_name && skill.author_name.trim()) || (skill.author && (skill.author.username || skill.author.avatar_url))" class="inline-flex items-center gap-2">
                <img
                  v-if="skill.author?.avatar_url"
                  :src="skill.author.avatar_url"
                  alt="avatar"
                  class="w-5 h-5 rounded-full"
                />
                <span>{{ (skill.author_name && skill.author_name.trim()) ? skill.author_name : (skill.author?.username || '官方') }}</span>
              </span>
              <span v-else>官方</span>
            </div>
          </div>
        </div>

        <!-- 友情链接区域移除：不再显示标题与链接列表 -->

        <!-- 去掉加载更多：首页不再使用该按钮 -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Search, ChevronRight, Star, Flame, Award, XCircle } from 'lucide-vue-next'
import { useSkillsStore } from '@/stores/skills'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const skillsStore = useSkillsStore()
const authStore = useAuthStore()
const { fetchLatestSkills, fetchFeaturedSkills } = skillsStore

// 搜索查询
const searchQuery = ref('')

// 清空首页搜索输入（不触发搜索）
/**
 * 清空首页搜索输入，不触发搜索行为。
 * @returns {void}
 */
const clearSearchInput = (): void => {
  console.log('clearSearchInput called, before:', searchQuery.value)
  searchQuery.value = ''
}

// MCP 服务器统计（示例展示用）
const serverCount = ref(16946)

// 收藏列表
const favorites = ref<string[]>([])

// 筛选器：仅保留“最新、精选”两项
const filters = [
  { value: 'latest', label: '最新', icon: Award },
  { value: 'featured', label: '精选', icon: Flame }
]

// 当前筛选：默认定位到“最新”
const activeFilter = ref('latest')

// 区域标题：随筛选动态变化
/**
 * 根据当前筛选返回区域标题文案。
 * - latest: "最新技能资源"
 * - featured: "精选技能资源"
 */
const sectionTitle = computed<string>(() => {
  return activeFilter.value === 'latest' ? '最新技能资源' : '精选技能资源'
})

// 首页总数统计：通过 Supabase RPC 获取
/** 当前站点已发布技能总数 */
const totalSkills = ref<number>(0)

// 技能数据：从数据库动态获取
const skills = ref<any[]>([])
/**
 * 页面加载状态：用于骨架屏显示
 */
const loading = ref(true)

// 过滤后的技能列表（首页不根据关键词搜索过滤，仅按筛选）
/**
 * 首页卡片列表（直接透传 store 返回的数据）。
 * 保持简单：不做关键词过滤，仅根据当前筛选（latest/featured）加载不同数据集。
 */
const filteredSkills = computed(() => skills.value)

// 友情链接数据（公开接口）
interface FriendLink {
  id: string
  name: string
  url: string
  description?: string
  sort_order: number
  enabled: boolean
}
const friendLinks = ref<FriendLink[]>([])

/**
 * 加载友情链接：从公开接口 `/api/links` 读取启用项。
 * - 按服务端排序结果展示
 * - 若返回空列表，页面不显示友情链接区域
 * @returns {Promise<void>} 无返回
 */
const loadFriendLinks = async (): Promise<void> => {
  try {
    const res = await fetch('/api/links', {
      headers: { 'Accept': 'application/json' }
    })
    if (!res.ok) return
    const data = await res.json().catch(() => ({ items: [] }))
    friendLinks.value = Array.isArray(data.items) ? data.items : []
  } catch {
    friendLinks.value = []
  }
}

// 数据加载
/**
 * 根据当前 activeFilter 从数据库加载技能列表。
 * - latest: 调用 fetchLatestSkills()
 * - featured: 调用 fetchFeaturedSkills()
 * 成功后赋值到本地 skills；错误时打印日志。
 */
/**
 * 根据当前筛选加载技能列表，并控制骨架屏显示。
 * @returns {Promise<void>} 无返回
 */
const loadSkillsForFilter = async (): Promise<void> => {
  console.log('[HomePage] loadSkillsForFilter:start', { activeFilter: activeFilter.value })
  loading.value = true
  try {
    const isLatest = activeFilter.value === 'latest'
    console.log('[HomePage] invoking store fetch', { isLatest })
    const list = isLatest ? await fetchLatestSkills() : await fetchFeaturedSkills()
    console.log('[HomePage] store fetch returned', { count: list?.length, sample: list?.[0] })
    skills.value = Array.isArray(list) ? list : []
  } catch (e: any) {
    console.error('[HomePage] 加载技能失败:', e?.message || e)
  } finally {
    loading.value = false
    console.log('[HomePage] loadSkillsForFilter:end', { loading: loading.value, skillsCount: skills.value.length })
  }
}

/**
 * 根据分类ID获取分类名称（空值安全）。
 * 优先使用全局分类列表，其次回退到映射 categoryMap。
 * 若仍不可用，返回空字符串，模板层统一显示“未分类”。
 * @param {string} categoryId 分类主键ID
 * @returns {string} 分类中文名称或空字符串
 */
const getCategoryName = (categoryId?: string): string => {
  if (!categoryId) return ''
  const byId = skillsStore.categories.find(c => c.id === categoryId)
  return byId?.name || skillsStore.categoryMap[categoryId] || ''
}

// 监听筛选切换，动态拉取数据
watch(activeFilter, () => {
  loadSkillsForFilter()
})

// 搜索处理
/**
 * 执行搜索跳转到搜索结果页。
 * - 当输入为空时不跳转。
 * - 使用 encodeURIComponent 防止注入风险。
 * @returns {void}
 */
const handleSearch = (): void => {
  const q = (searchQuery.value || '').trim()
  if (!q) return
  router.push(`/search?q=${encodeURIComponent(q)}`)
}

// 收藏交互（与 /skills 对齐）
/**
 * 轻量 Toast 文案
 */
const loginToast = ref<string>('')
/** 是否显示 Toast */
const showToast = ref(false)
let toastTimer: number | null = null
/**
 * 显示底部 Toast，并在3秒后自动隐藏。
 * @param {string} message 提示文案
 */
const showToastMessage = (message: string) => {
  loginToast.value = message
  showToast.value = true
  if (toastTimer) {
    window.clearTimeout(toastTimer)
    toastTimer = null
  }
  toastTimer = window.setTimeout(() => {
    showToast.value = false
    toastTimer = null
  }, 3000)
}

/** 收藏确认弹层状态 */
const showFavoriteConfirm = ref(false)
/** 待收藏的技能 */
const pendingFavoriteSkill = ref<any | null>(null)

/**
 * 处理收藏点击：登录校验，已收藏则取消，未收藏弹出确认。
 * @param {any} skill 技能对象
 */
const handleFavorite = async (skill: any) => {
  if (!authStore.isAuthenticated) {
    showToastMessage('请先登录以收藏')
    return
  }
  if (favorites.value.includes(skill.id)) {
    await removeFavorite(skill.id)
    return
  }
  pendingFavoriteSkill.value = skill
  showFavoriteConfirm.value = true
}

/**
 * 确认收藏：插入 Supabase `user_favorites`
 */
const confirmFavorite = async (): Promise<void> => {
  const skill = pendingFavoriteSkill.value
  showFavoriteConfirm.value = false
  if (!skill) return
  if (favorites.value.includes(skill.id)) return
  try {
    const { error } = await supabase
      .from('user_favorites')
      .insert({ user_id: authStore.user.id, skill_id: skill.id })
    if (error) {
      console.warn('收藏失败或已收藏：', error.message)
      showToastMessage('已收藏或操作失败')
    } else {
      favorites.value = Array.from(new Set([...favorites.value, skill.id]))
      showToastMessage('已加入收藏')
    }
  } catch (e: any) {
    console.error('收藏异常：', e)
    showToastMessage('操作异常，请稍后重试')
  } finally {
    pendingFavoriteSkill.value = null
  }
}

/**
 * 取消收藏：删除 Supabase `user_favorites` 记录
 * @param {string} skillId 技能ID
 */
const removeFavorite = async (skillId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', authStore.user.id)
      .eq('skill_id', skillId)
    if (error) {
      console.warn('取消收藏失败：', error.message)
      showToastMessage('取消收藏失败或未收藏')
      return
    }
    favorites.value = favorites.value.filter(id => id !== skillId)
    showToastMessage('已取消收藏')
  } catch (e: any) {
    console.error('取消收藏异常：', e)
    showToastMessage('操作异常，请稍后重试')
  }
}

/** 取消收藏确认 */
const cancelFavorite = (): void => {
  showFavoriteConfirm.value = false
  pendingFavoriteSkill.value = null
}

/**
 * 加载当前用户的收藏列表
 */
const loadFavorites = async (): Promise<void> => {
  try {
    if (!authStore.isAuthenticated) {
      favorites.value = []
      return
    }
    const { data, error } = await supabase
      .from('user_favorites')
      .select('skill_id')
      .eq('user_id', authStore.user.id)
    if (error) {
      console.warn('加载收藏失败：', error.message)
      return
    }
    favorites.value = (data || []).map((r: any) => r.skill_id)
  } catch (e) {
    console.warn('加载收藏异常：', e)
  }
}

// 跳转到技能详情
/**
 * 跳转到技能详情页
 * 修复错误的路由路径 `/skill/:id` -> `/skills/:id`
 * @param {string} skillId 技能ID
 */
const goToSkillDetail = (skillId: string) => {
  router.push(`/skills/${skillId}`)
}

// 加载更多
/**
 * 加载更多技能卡片（示例）
 * 可替换为真实分页或懒加载逻辑。
 */
const loadMore = (): void => {
  // 模拟加载更多数据
  console.log('加载更多技能...')
}

// 初始化
onMounted(async () => {
  console.log('[HomePage] onMounted:start')
  try {
    // 确保分类映射可用
    console.log('[HomePage] ensureCategoriesLoaded:begin')
    await skillsStore.ensureCategoriesLoaded()
    console.log('[HomePage] ensureCategoriesLoaded:end', { categories: skillsStore.categories.length })

    // 初始加载当前筛选数据
    await loadSkillsForFilter()

    // 加载总数（仅已发布）
    console.log('[HomePage] fetchTotalCount:begin')
    const count = await skillsStore.fetchTotalCount()
    totalSkills.value = count
    console.log('[HomePage] fetchTotalCount:end', { totalSkills: totalSkills.value })

    // 统计状态分布并输出到控制台，便于核对首页显示
    console.log('[HomePage] getStatusCountsAggregate:begin')
    try {
      const counts = await skillsStore.getStatusCountsAggregate()
      console.log('[HomePage] getStatusCountsAggregate:end', counts)
    } catch (e) {
      console.warn('[HomePage] 获取状态统计失败:', e)
    }

    // 加载用户收藏（登录后）
    console.log('[HomePage] loadFavorites:begin', { isAuthenticated: authStore.isAuthenticated })
    await loadFavorites()
    console.log('[HomePage] loadFavorites:end', { favoritesCount: favorites.value.length })

    // 加载友情链接（公开接口）
    console.log('[HomePage] loadFriendLinks:begin')
    await loadFriendLinks()
    console.log('[HomePage] loadFriendLinks:end', { linksCount: friendLinks.value.length })
  } catch (e) {
    console.error('[HomePage] onMounted:error', e)
  } finally {
    console.log('[HomePage] onMounted:end')
  }
})

// 监听登录状态变化，同步收藏列表
watch(
  () => authStore.isAuthenticated,
  async (isAuthed) => {
    if (isAuthed) {
      await loadFavorites()
    } else {
      favorites.value = []
    }
  }
)
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
</style>