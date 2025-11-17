/**
 * 技能列表页面
 * 左右布局：左侧固定边栏（搜索+分类），右侧技能卡片网格
 * 参考AI工具平台设计风格
 */
<template>
  <div class="min-h-screen bg-[#F8F4EE]">
    <!-- 轻量提示：登录引导 Toast -->
    <div
      v-if="showToast"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg shadow z-50"
    >
      {{ loginToast }}
    </div>
    <!-- 收藏确认弹层 -->
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
    <!-- 页面头部 -->
    <div class="bg-transparent">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="text-left">
<h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-2">技能资源</h1>
          <p class="text-lg text-gray-600 max-w-2xl">
汇聚社区中优质的 Skills 技能资源，助力全面提升 AI 使用效率
          </p>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="space-y-6">

        <!-- 右侧主内容区域 -->
        <div>
          

          <!-- 顶部分类标签（静态快照，用于筛选） -->
          <div class="mb-6">
            <div v-if="categoriesLoading" class="flex flex-wrap items-center gap-2 animate-pulse">
              <div v-for="n in 10" :key="n" class="h-8 rounded-full bg-gray-200" :class="[
                n % 5 === 0 ? 'w-28' : n % 5 === 1 ? 'w-24' : n % 5 === 2 ? 'w-20' : n % 5 === 3 ? 'w-32' : 'w-16'
              ]"></div>
            </div>
            <div v-else class="flex flex-wrap items-center gap-2">
              <button
                @click="selectCategory('')"
                :class="[
                  'px-3 py-1.5 text-sm rounded-full border transition-colors',
                  selectedCategory === '' ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                ]"
              >
                全部
              </button>
              <button
                v-for="cat in categoryOptions"
                :key="cat.id"
                @click="selectCategory(cat.id)"
                :class="[
                  'px-3 py-1.5 text-sm rounded-full border transition-colors inline-flex items-center gap-2',
                  selectedCategory === cat.id ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                ]"
                type="button"
              >
                <span>{{ cat.name }}</span>
                <span class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{{ cat.count }}</span>
              </button>
            </div>
          </div>


          <div class="mb-6">
            <div class="flex items-center gap-2 mb-4">
              <component :is="getCategoryIcon(currentTitle)" class="w-6 h-6 text-orange-600" />
              <h2 class="text-2xl font-bold text-gray-900">{{ currentTitle }}</h2>
            </div>
          </div>

          <!-- 加载状态：骨架屏（12项） -->
          <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-4">
            <div v-for="n in 12" :key="n" class="bg-white rounded-2xl shadow-sm border border-[#EEEEEE] p-6 animate-pulse">
              <div class="h-4 w-24 bg-gray-200 rounded mb-3"></div>
              <div class="h-5 w-48 bg-gray-200 rounded mb-2"></div>
              <div class="space-y-2 mb-4">
                <div class="h-3 w-full bg-gray-200 rounded"></div>
                <div class="h-3 w-5/6 bg-gray-200 rounded"></div>
                <div class="h-3 w-4/6 bg-gray-200 rounded"></div>
              </div>
              <div class="flex items-center justify-between">
                <div class="h-4 w-20 bg-gray-200 rounded"></div>
                <div class="h-5 w-28 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
          
          <!-- 错误状态 -->
          <div v-else-if="error" class="text-center py-12">
            <p class="text-red-600">{{ error }}</p>
            <button
              @click="loadSkills"
              class="px-3 py-1.5 text-sm rounded-md bg-orange-600 text-white hover:bg-orange-700 transition-colors duration-200"
            >
              重试
            </button>
          </div>
          
          <!-- 空状态 -->
          <div v-else-if="displayedSkills.length === 0" class="text-center py-12">
            <Search class="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">没有找到相关技能</h3>
            <p class="text-gray-600 mb-4">试试其他分类</p>
            <button
              @click="resetFilters"
              class="px-3 py-1.5 text-sm rounded-md bg-orange-600 text-white hover:bg-orange-700 transition-colors duration-200"
            >
              重置筛选
            </button>
          </div>
          
          <!-- 技能网格（白卡风格） -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div
              v-for="skill in displayedSkills"
              :key="skill.id"
              class="group bg-white rounded-2xl shadow-sm border border-[#EEEEEE] p-6 cursor-pointer hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden min-h-[280px] h-auto"
              @click="handleDownload(skill.id)"
            >
              <!-- 顶部：精选徽章、标题与星标 -->
              <div class="flex justify-between items-start mb-3">
                <!-- 左侧：徽章 + 标题（标题容器允许收缩） -->
                <div class="flex items-center gap-2 flex-1 min-w-0">
                  <span
                    v-if="skill.recommended || skill.featured"
                    class="px-2 py-1 text-xs rounded-full bg-[#FF7A45] text-white flex-shrink-0"
                  >
                    精选
                  </span>
                  <h3
                    class="font-semibold text-gray-800 text-lg truncate min-w-0 transition-colors duration-200 group-hover:text-[#FF7A45]"
                    v-truncate-title="skill.title"
                  >
                    {{ skill.title }}
                  </h3>
                </div>
                <button
                  class="p-1 rounded hover:bg-gray-100 flex-shrink-0"
                  title="收藏"
                  @click.stop="handleFavorite(skill)"
                >
                  <Star
                    :class="[
                      'w-5 h-5',
                      favoritesSet.has(skill.id) ? 'text-yellow-500 fill-current' : 'text-gray-400'
                    ]"
                  />
                </button>
              </div>

              <!-- 描述：限制为 5 行，超出省略 -->
              <p class="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-5">{{ skill.description }}</p>

              <!-- 标签芯片 -->
              <div class="flex flex-wrap gap-2 mb-4">
                <span
                  v-for="tag in (skill.tags || []).slice(0, 3)"
                  :key="typeof tag === 'string' ? tag : (tag?.id || String(tag))"
                  class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700"
                >
                  {{ typeof tag === 'string' ? tag : (tag?.name || '') }}
                </span>
              </div>

              <!-- 页脚：左分类、右作者（无作者显示“官方”） -->
              <div class="mt-auto flex items-center justify-between text-gray-500 text-sm">
                <span>{{ getCategoryName(skill.category_id || (typeof skill.category === 'string' ? skill.category : (skill.category?.name || ''))) || '未分类' }}</span>
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
          
          <div v-if="totalPages > 1" class="flex justify-center space-x-2 mt-8">
            <button
              @click="goToPage(1)"
              :disabled="currentPage === 1"
              class="px-2 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              首页
            </button>
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-2 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              上一页
            </button>
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              :class="[
                'px-2 py-1 rounded-lg transition-colors duration-200',
                currentPage === page
                  ? 'bg-orange-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              ]"
            >
              {{ page }}
            </button>
            <button
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="px-2 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              下一页
            </button>
            <button
              @click="goToPage(totalPages)"
              :disabled="currentPage === totalPages"
              class="px-2 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              尾页
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  Search, 
  Code, 
  Palette, 
  Database, 
  Settings,
  Download,
  Star,
  TrendingUp,
  Clock,
  Filter,
  Grid3x3
} from 'lucide-vue-next'
import { useSkillsStore } from '@/stores/skills'
import { useAuthStore } from '@/stores/auth'
import SkillCard from '@/components/SkillCard.vue'
import { supabase } from '@/lib/supabase'

const route = useRoute()
const router = useRouter()
const skillsStore = useSkillsStore()
const authStore = useAuthStore()

// 状态管理
// 搜索功能已移除
const selectedCategory = ref('')
const sortBy = ref('createdAt')
const currentPage = ref(1)
const itemsPerPage = ref(24)
/**
 * 左侧分类骨架屏加载状态。
 * 在进入页面时先置为 true，待分类数据加载完成后置为 false。
 */
const categoriesLoading = ref(true)

/**
 * 收藏状态管理
 * - favorites: 当前用户收藏的技能ID列表
 * - favoritesSet: 便于模板中 O(1) 判断是否已收藏
 */
const favorites = ref<string[]>([])
const favoritesSet = computed(() => new Set(favorites.value))

// 排序选项
const sortOptions = [
  { value: 'createdAt', label: '最新发布' },
  { value: 'downloads', label: '下载最多' },
  { value: 'rating', label: '评分最高' },
  { value: 'title', label: '名称排序' }
]

// 计算属性
const skills = computed(() => skillsStore.skills)
const categories = computed(() => skillsStore.categories)
const isLoading = computed(() => skillsStore.loading)
const error = computed(() => skillsStore.error)
// 分页总数基于当前技能条目数量计算，避免因缺失 store 字段导致 NaN
// 过滤后列表与总页数（用于分页/空状态）
/**
 * 过滤后的技能列表
 * - 使用 `selectedCategory` 的分类ID进行过滤（与后端返回的 `category_id` 对齐）。
 * - 兼容旧字段 `category`（名称）但优先按ID匹配，避免名称变更导致的筛选失效。
 */
  const filteredList = computed(() => skills.value.slice())
  const totalPages = computed(() => Math.ceil((skillsStore.totalCount || 0) / itemsPerPage.value))

  const currentTitle = computed(() => {
    const name = selectedCategory.value ? getCategoryName(selectedCategory.value) : ''
    return name && name.trim() ? name : '全部'
  })

// 带统计的分类列表
/**
 * 带统计的分类列表
 * - 统计依据为技能的 `category_id` 与分类 `id` 的精确匹配。
 * - 兼容旧数据的名称匹配，避免显示计数不正确。
 */
const categoriesWithCount = computed(() => {
  return categories.value.map(category => ({
    ...category,
    count: (skillsStore.categoryCounts[category.id] ?? 0)
  }))
})
// 静态分类选项：初始化后快照，不随右侧列表和筛选变化
const categoryOptions = ref<any[]>([])

// 可见页面
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
 * 过滤与分页后的技能集合。
 * - 根据 `searchQuery` 在标题、描述、标签中模糊匹配。
 * - 根据 `selectedCategory` 过滤分类。
 * - 简单排序示例：按标题或下载数或创建时间。
 */
const displayedSkills = computed(() => filteredList.value)

/**
 * 收藏交互：阻止冒泡，登录校验，确认后入库。
 * - 未登录：底部 Toast 提示登录。
 * - 已登录：插入 `user_favorites` 表；若已存在则忽略或可改为取消收藏。
 */
const showFavoriteConfirm = ref(false)
const pendingFavoriteSkill = ref<any | null>(null)

const handleFavorite = async (skill: any) => {
  // 阻止冒泡已在模板 @click.stop 处理
  if (!authStore.isAuthenticated) {
    showToastMessage('请先登录以收藏')
    return
  }
  // 已收藏则直接取消收藏
  if (favoritesSet.value.has(skill.id)) {
    await removeFavorite(skill.id)
    return
  }
  // 未收藏则弹出确认
  pendingFavoriteSkill.value = skill
  showFavoriteConfirm.value = true
}

/**
 * 确认收藏：入库 user_favorites
 */
const confirmFavorite = async () => {
  const skill = pendingFavoriteSkill.value
  showFavoriteConfirm.value = false
  if (!skill) return
  // 若已在收藏集合中，直接返回（理论上不会到这里）
  if (favoritesSet.value.has(skill.id)) return
  try {
    const { error } = await supabase
      .from('user_favorites')
      .insert({ user_id: authStore.user.id, skill_id: skill.id })
    if (error) {
      console.warn('收藏失败或已收藏：', error.message)
      showToastMessage('已收藏或操作失败')
    } else {
      // 本地状态立即更新，确保星标高亮
      if (!favoritesSet.value.has(skill.id)) {
        favorites.value = Array.from(new Set([...favorites.value, skill.id]))
      }
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
 * 取消收藏：从 Supabase `user_favorites` 删除记录并更新本地状态。
 * @param {string} skillId - 技能ID
 * @returns {Promise<void>} 无返回值
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
    // 更新本地状态
    favorites.value = favorites.value.filter(id => id !== skillId)
    showToastMessage('已取消收藏')
  } catch (e: any) {
    console.error('取消收藏异常：', e)
    showToastMessage('操作异常，请稍后重试')
  }
}

/** 取消收藏确认 */
const cancelFavorite = () => {
  showFavoriteConfirm.value = false
  pendingFavoriteSkill.value = null
}

/**
 * 获取分类图标
 * 返回与分类名称对应的图标组件，用于左侧分类与右侧标题展示。
 * 当传入的分类名称未匹配时，降级为默认图标。
 * @param {string} categoryName - 分类名称（如“前端开发”、“UI设计”等）
 * @returns {any} 对应的 lucide 图标组件
 */
/**
 * 返回用于表示“分类”的统一图标。
 * 无论传入的分类名称为何，统一返回 Grid3x3 以提高可识别性。
 * 保留函数签名以兼容现有模板调用点。
 * @param {string} categoryName - 分类名称。
 * @returns {any} Vue 图标组件。
 */
const getCategoryIcon = (categoryName: string) => {
  return Grid3x3
}

/**
 * 获取技能图标
 * 根据技能的分类 ID 查找分类并返回对应的图标组件，
 * 用于技能卡片 Logo 区域展示。
 * @param {string} categoryId - 技能所属分类的唯一 ID
 * @returns {any} 对应的 lucide 图标组件
 */
const getSkillIcon = (categoryId: string) => {
  const category = categories.value.find(c => c.id === categoryId)
  return getCategoryIcon(category?.name || '')
}

/**
 * 根据分类ID或名称返回显示名称。
 * - 传入分类ID时在 `categories` 列表中查找其名称；
 * - 若传入已是名称则直接返回；
 * - 兜底返回空字符串，供UI显示“未分类”。
 * @param {string} categoryOrId 分类ID或名称
 * @returns {string} 分类显示名称
 */
const getCategoryName = (categoryOrId: string): string => {
  if (!categoryOrId) return ''
  const byId = categories.value.find(c => c.id === categoryOrId)
  return byId?.name || categoryOrId
}

/**
 * 加载技能数据
 */
const loadSkills = async () => {
  await skillsStore.fetchSkillsPaged(currentPage.value, itemsPerPage.value, '', selectedCategory.value || '')
}

/**
 * 处理搜索
 */
// 搜索功能已移除

/**
 * 选择分类
 */
/**
 * 选择分类
 * 使用分类ID作为选中值，避免名称匹配导致的过滤失败。
 * @param {string} categoryId 分类ID
 */
const selectCategory = (categoryId: string) => {
  selectedCategory.value = selectedCategory.value === categoryId ? '' : categoryId
  currentPage.value = 1
}

/**
 * 选择排序
 */
const selectSort = (sort: string) => {
  sortBy.value = sort
  currentPage.value = 1
}

/**
 * 跳转到指定页面
 */
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

/**
 * 重置筛选
 */
const resetFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  sortBy.value = 'createdAt'
  currentPage.value = 1
}

/**
 * 处理技能下载
 */
/**
 * 处理技能下载：未登录展示页面内提示，已登录跳转详情。
 * 使用非阻塞的轻量提示代替 window.confirm。
 */
const loginToast = ref<string>('')
const showToast = ref(false)

/**
 * 显示底部 Toast，并在3秒后自动隐藏。
 * 使用统一方法替换直接赋值，避免提示不消失的问题。
 * @param {string} message 显示的提示文本
 */
let toastTimer: number | null = null
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

/**
 * 处理技能下载或查看详情：直接跳转详情页，无需登录。
 * @param {string} skillId 技能ID
 */
const handleDownload = (skillId: string) => {
  router.push(`/skills/${skillId}`)
}

onMounted(async () => {
  // 页面进入即显示骨架屏（技能列表）
  skillsStore.setLoading(true)
  // 加载分类数据
  categoriesLoading.value = true
  await skillsStore.fetchCategories()
  categoriesLoading.value = false
  // 加载技能数据
  await loadSkills()
  // 加载用户收藏数据（仅登录后）
  await loadFavorites()
  await skillsStore.fetchCategoryCounts()
  categoryOptions.value = categoriesWithCount.value
})

watch([currentPage, itemsPerPage, selectedCategory], async () => {
  await loadSkills()
})

/**
 * 加载用户收藏数据
 * 从 Supabase `user_favorites` 中读取当前用户的收藏技能ID
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

/**
 * 监听登录状态变化，登录后重新加载收藏列表；登出清空。
 */
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
/* 多行省略：限制为 5 行 */
.line-clamp-5 {
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 水滴形排行标记：通过不对称圆角并旋转形成水滴效果 */
.droplet {
  border-radius: 50% 50% 50% 0;
}
</style>
