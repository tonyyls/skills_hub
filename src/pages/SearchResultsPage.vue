<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 页面头部 -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center">
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            搜索结果
          </h1>
          <p class="text-lg text-gray-600">
            找到 <span class="font-semibold text-orange-600">{{ totalResults }}</span> 个与 
            <span class="font-semibold text-gray-900">"{{ searchKeyword }}"</span> 相关的结果
          </p>
        </div>
        
        <!-- 搜索框（与首页风格保持一致） -->
        <div class="max-w-2xl mx-auto mt-8">
          <div class="relative group bg-stone-100 rounded-xl shadow-sm p-6">
            <div class="relative bg-white border border-stone-200 rounded-full p-1 shadow-sm focus-within:border-0 focus-within:border-transparent focus-within:ring-0 focus-within:shadow-none">
              <div class="flex items-center">
                <Search class="w-5 h-5 text-gray-400 ml-4" />
                <input
                  v-model="currentSearchQuery"
                  @keyup.enter="performNewSearch"
                  type="text"
                  placeholder="关键词搜索"
                  class="flex-1 bg-transparent border-none outline-none appearance-none focus:outline-none focus-visible:outline-none focus:ring-0 focus:border-transparent px-4 py-3 text-gray-900 placeholder-gray-400 text-base"
                  v-select-all-shortcut
                />
                <!-- 仅在有输入时显示的清除图标按钮 -->
                <button
                  v-if="currentSearchQuery"
                  @click="currentSearchQuery = ''"
                  class="ml-1 mr-1 rounded-full p-1 text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 transition-colors"
                  aria-label="清除搜索"
                  title="清除"
                >
                  <XCircle class="w-4 h-4" />
                </button>
                <button
                  @click="performNewSearch"
                  class="px-3 py-1.5 text-sm rounded-full bg-orange-600 text-white hover:bg-orange-700 transition-all duration-300 mr-1"
                >
                  搜索
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- 结果列表（全宽） -->
          <!-- 加载状态 -->
          <div v-if="loading" class="text-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p class="text-gray-600">正在搜索...</p>
          </div>

          <!-- 无结果 -->
          <div v-else-if="searchResults.length === 0" class="text-center py-12">
            <!-- 已移除空结果搜索图标 -->
            <h3 class="text-xl font-semibold text-gray-900 mb-2">未找到相关结果</h3>
            <p class="text-gray-600 mb-6">尝试使用不同的关键词或调整筛选条件</p>
          </div>

          <!-- 搜索结果列表（横条卡容器 + 行分隔） -->
          <div v-else class="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div
              v-for="skill in searchResults"
              :key="skill.id"
              class="px-6 py-5 border-b border-gray-200 last:border-b-0 group cursor-pointer"
              @click="goToSkillDetail(skill.id)"
            >
              <div class="flex items-start justify-between">
                <!-- 左侧内容 -->
                <div class="flex-1">
                  <!-- 标题与状态图标 -->
                  <div class="flex items-center gap-2 mb-1">
                    <h3 class="text-lg font-semibold text-gray-900 transition-colors group-hover:text-[#FF7A45]">
                      <span v-html="highlightText(skill.title ?? skill.name ?? '', searchKeyword)"></span>
                    </h3>
                    <!-- 已移除精选/推荐图标 -->
                  </div>

                  <!-- 描述 -->
                  <p class="text-sm text-gray-600 mb-2">
                    <span v-html="highlightText(skill.description || '', searchKeyword)"></span>
                  </p>

                  <!-- 标签 -->
                  <div class="flex flex-wrap gap-2 mb-3">
                    <span
                      v-for="tag in (skill.tags || []).slice(0, 5)"
                      :key="tag"
                      class="px-2 py-1 text-xs rounded-full bg-gradient-to-r from-[#FF7A45] to-[#E07245] text-white shadow-sm ring-1 ring-white/10"
                    >
                      {{ tag }}
                    </span>
                  </div>

                  <!-- 元数据行：左分类、右作者（两端对齐） -->
                  <div class="flex items-center justify-between text-xs text-gray-500">
                    <span class="text-gray-600">{{ getCategoryDisplay(skill) }}</span>
                    <span class="text-gray-700">{{ getAuthorDisplay(skill) }}</span>
                  </div>
                </div>

                <!-- 右侧操作：已移除查看详情按钮，保持卡片简洁 -->
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div v-if="totalPages > 1" class="flex justify-center mt-12">
            <div class="flex space-x-2">
              <button
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage <= 1"
                :class="getButtonClass('primary', 'large', currentPage <= 1)"
              >
                上一页
              </button>
              
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="goToPage(page)"
                :class="getButtonClass('primary', 'large')"
              >
                {{ page }}
              </button>
              
              <button
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage >= totalPages"
                :class="getButtonClass('primary', 'large', currentPage >= totalPages)"
              >
                下一页
              </button>
            </div>
          </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useSkillsStore } from '@/stores/skills'
import { useRoute, useRouter } from 'vue-router'
import { Package, Scale, Search, XCircle } from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'
import type { Skill } from '@/lib/supabase'
import { getButtonClass } from '@/utils/buttonStyles'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

const route = useRoute()
const router = useRouter()
dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

// 使用全局 store 的分类映射，避免重复请求
const skillsStore = useSkillsStore()
onMounted(() => {
  skillsStore.ensureCategoriesLoaded()
})

// 搜索状态
const currentSearchQuery = ref('')
const searchKeyword = ref('')
const searchResults = ref<Skill[]>([])
const totalResults = ref(0)
const loading = ref(false)

const selectedDifficulty = ref('')

// 分页状态
const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalPages = ref(1)

// 计算属性
const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

/**
 * 高亮显示搜索文本
 */
const highlightText = (text: string = '', query: string) => {
  if (!text || !query || !query.trim()) return text
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')})`, 'gi')
  return text.replace(regex, '<mark class="bg-orange-200 text-gray-900 font-semibold">$1</mark>')
}


/**
 * 获取难度标签
 */
const getDifficultyLabel = (difficulty: string) => {
  const labels: Record<string, string> = {
    'beginner': '初级',
    'intermediate': '中级',
    'advanced': '高级'
  }
  return labels[difficulty] || '未知'
}

/**
 * 格式化日期
 */
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

/**
 * 相对时间，如“8个月前”
 * @param dateString 日期字符串
 */
const formatRelative = (dateString: string) => {
  return dayjs(dateString).fromNow()
}

/**
 * 获取作者显示名称
 * @param skill 技能对象
 */
const getAuthorDisplay = (skill: Skill) => {
  const name = (skill.author_name && skill.author_name.trim()) ? skill.author_name : (skill.author?.username || '官方')
  return name
}

/**
 * 获取分类显示名称（空值安全）
 * @param skill 技能对象
 * @returns 分类名称；若无则返回“未分类”
 */
const getCategoryDisplay = (skill: Skill) => {
  const nameFromRelation = skill.category?.name || ''
  const nameFromMap = skill.category_id ? (skillsStore.categoryMap[skill.category_id] || '') : ''
  const name = nameFromRelation || nameFromMap
  return name && name.trim() ? name : '未分类'
}

/**
 * 生成作者头像占位URL（与站内一致）
 * @param skill 技能对象
 */
const getAvatarUrl = (skill: Skill) => {
  const name = getAuthorDisplay(skill)
  const bg = 'cccccc'
  const color = 'ffffff'
  return skill.author?.avatar_url ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=${color}`
}

/**
 * 跳转到技能详情页
 * @param skillId 技能ID
 */
const goToSkillDetail = (skillId: string) => {
  if (!skillId) return
  router.push(`/skills/${skillId}`)
}

/**
 * 执行搜索
 * 当搜索关键词为空时，不执行后端查询，直接清空结果。
 */
const performSearch = async () => {
  const term = searchKeyword.value.trim()
  if (!term) {
    searchResults.value = []
    totalResults.value = 0
    totalPages.value = 0
    loading.value = false
    return
  }
  loading.value = true
  try {
    /**
     * 构建搜索查询，支持 name/title 与 description 的 ilike 模糊匹配。
     * 当某环境没有 name 字段时，自动回退到 title。
     * @param includeName 是否包含 name 字段条件
     * @returns Supabase 查询对象
     */
    const buildSearchQuery = (includeName: boolean) => {
      let q = supabase
        .from('skills')
        .select('*', { count: 'exact' })
        .eq('status', 'published')

      if (searchKeyword.value.trim()) {
        const term = searchKeyword.value.trim()
        const wildcard = `%${term}%`
        const conditions = [
          includeName ? `name.ilike.${wildcard}` : `title.ilike.${wildcard}`,
          `description.ilike.${wildcard}`,
          `author_name.ilike.${wildcard}`,
          // tags 为 text[]，用 contains 判断集合中是否存在关键词
          `tags.cs.{${term}}`
        ].join(',')
        q = q.or(conditions)
      }

      if (selectedDifficulty.value) {
        q = q.eq('difficulty_level', selectedDifficulty.value)
      }

      const offset = (currentPage.value - 1) * itemsPerPage.value
      q = q.range(offset, offset + itemsPerPage.value - 1)

      return q
    }

    // 先尝试 name + description 模糊匹配；若 name 不存在则回退到 title + description
    let { data, error, count } = await buildSearchQuery(true)
    if (error) {
      const msg = String((error as any)?.message || '')
      const details = String((error as any)?.details || '')
      const nameMissing = msg.includes('name') || details.includes('name')
      if (nameMissing) {
        const res2 = await buildSearchQuery(false)
        const { data: data2, error: error2, count: count2 } = await res2
        if (!error2 && data2) {
          searchResults.value = data2
          totalResults.value = count2 || 0
          totalPages.value = Math.ceil((count2 || 0) / itemsPerPage.value)
        } else {
          console.error('搜索失败:', error2)
        }
      } else {
        console.error('搜索失败:', error)
      }
    } else if (data) {
      searchResults.value = data
      totalResults.value = count || 0
      totalPages.value = Math.ceil((count || 0) / itemsPerPage.value)
    }

  } catch (error) {
    console.error('搜索失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 执行新搜索
 */
const performNewSearch = () => {
  if (currentSearchQuery.value.trim()) {
    router.push(`/search?q=${encodeURIComponent(currentSearchQuery.value)}`)
  }
}

/**
 * 筛选结果
 */
const filterResults = () => {
  currentPage.value = 1
  performSearch()
}

/**
 * 跳转到指定页面
 */
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    performSearch()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

/**
 * 查看技能详情
 */
const viewSkillDetail = (skillId: string) => {
  router.push(`/skills/${skillId}`)
}

/**
 * 一键清除搜索输入并刷新结果
 * - 清空当前输入并移除路由参数 `q`
 * - 由路由监听触发重新搜索，避免重复调用
 */
const clearSearch = (): void => {
  currentSearchQuery.value = ''
  router.push('/search')
}
/**
 * 重置搜索
 */
const resetSearch = () => {
  selectedDifficulty.value = ''
  currentPage.value = 1
  performSearch()
}

// 监听路由参数变化
watch(
  () => route.query.q,
  (newQuery) => {
    searchKeyword.value = (newQuery as string) || ''
    currentSearchQuery.value = searchKeyword.value
    currentPage.value = 1
    if (!searchKeyword.value.trim()) {
      searchResults.value = []
      totalResults.value = 0
      totalPages.value = 0
      loading.value = false
      return
    }
    performSearch()
  },
  { immediate: true }
)

// 监听分页变化
watch(currentPage, () => {
  performSearch()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

mark {
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
}
</style>
