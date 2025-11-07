/**
 * 技能列表页面
 * 左右布局：左侧固定边栏（搜索+分类），右侧技能卡片网格
 * 参考AI工具平台设计风格
 */
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 页面头部 -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="text-center">
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-2">技能资源</h1>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            发现和学习各种技能，从编程开发到设计创意，从数据分析到产品运营
          </p>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex gap-6">
        <!-- 左侧固定边栏 -->
        <div class="w-80 flex-shrink-0">
          <div class="sticky top-6 space-y-6">
            <!-- 搜索框 -->
            <div class="bg-white rounded-lg border border-gray-200 p-4">
              <div class="relative">
                <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  v-model="searchQuery"
                  @input="handleSearch"
                  type="text"
                  placeholder="搜索模型名称"
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <!-- 分类列表 -->
            <div class="bg-white rounded-lg border border-gray-200">
              <div class="p-4 border-b border-gray-200">
                <h3 class="font-semibold text-gray-900">分类</h3>
              </div>
              <div class="p-2">
                <button
                  v-for="category in categoriesWithCount"
                  :key="category.id"
                  @click="selectCategory(category.name)"
                  :class="[
                    'w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors duration-200',
                    selectedCategory === category.name
                      ? 'bg-orange-50 text-orange-700 border border-orange-200'
                      : 'hover:bg-gray-50 text-gray-700'
                  ]"
                >
                  <div class="flex items-center gap-3">
                    <component :is="getCategoryIcon(category.name)" class="w-5 h-5 text-gray-400" />
                    <span class="font-medium">{{ category.name }}</span>
                  </div>
                  <span class="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {{ category.count }}
                  </span>
                </button>
              </div>
            </div>

            <!-- 排序选项 -->
            <div class="bg-white rounded-lg border border-gray-200 p-4">
              <h3 class="font-semibold text-gray-900 mb-3">排序</h3>
              <div class="space-y-2">
                <button
                  v-for="option in sortOptions"
                  :key="option.value"
                  @click="selectSort(option.value)"
                  :class="[
                    'w-full text-left p-2 rounded-lg transition-colors duration-200',
                    sortBy === option.value
                      ? 'bg-orange-50 text-orange-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  ]"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧主内容区域 -->
        <div class="flex-1">
          <!-- 当前分类标题 -->
          <div class="mb-6" v-if="selectedCategory">
            <div class="flex items-center gap-2 mb-4">
              <component :is="getCategoryIcon(selectedCategory)" class="w-6 h-6 text-blue-600" />
              <h2 class="text-2xl font-bold text-gray-900">{{ selectedCategory }}</h2>
            </div>
          </div>

          <!-- 加载状态 -->
          <div v-if="isLoading" class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <p class="mt-4 text-gray-600">加载中...</p>
          </div>
          
          <!-- 错误状态 -->
          <div v-else-if="error" class="text-center py-12">
            <p class="text-red-600">{{ error }}</p>
            <button
              @click="loadSkills"
              class="mt-4 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200"
            >
              重试
            </button>
          </div>
          
          <!-- 空状态 -->
          <div v-else-if="skills.length === 0" class="text-center py-12">
            <Search class="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">没有找到相关技能</h3>
            <p class="text-gray-600 mb-4">试试其他关键词或分类</p>
            <button
              @click="resetFilters"
              class="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200"
            >
              重置筛选
            </button>
          </div>
          
          <!-- 技能网格 -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div
              v-for="(skill, index) in skills"
              :key="skill.id"
              class="relative"
            >
              <!-- 排名标记（水滴形） -->
              <div
                v-if="index < 3 && !selectedCategory"
                class="absolute -left-2 -top-2 w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-600 droplet flex items-center justify-center text-white text-xs font-bold shadow-lg z-10 rotate-45"
              >
                <span class="-rotate-45">{{ index + 1 }}</span>
              </div>
              
              <!-- 推荐badge -->
              <div
                v-if="skill.isRecommended"
                class="absolute -right-2 -top-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg z-10"
              >
                推荐
              </div>

              <!-- 技能卡片 -->
              <div class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-orange-200 h-full">
                <!-- Logo和标题 -->
                <div class="flex items-start gap-4 mb-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <component 
                      :is="getSkillIcon(skill.category)" 
                      class="w-6 h-6 text-white"
                    />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-gray-900 text-lg leading-tight mb-1">
                      {{ skill.title }}
                    </h3>
                    <!-- 免费标签 -->
                    <div v-if="skill.isFree" class="inline-flex items-center gap-1">
                      <span class="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                        免费
                      </span>
                    </div>
                    <!-- 价格信息 -->
                    <div v-else-if="skill.price" class="text-sm text-gray-600">
                      {{ skill.price }}
                    </div>
                  </div>
                </div>

                <!-- 描述 -->
                <p class="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                  {{ skill.description }}
                </p>

                <!-- 标签 -->
                <div class="flex flex-wrap gap-2 mb-4">
                  <span
                    v-for="tag in skill.tags.slice(0, 3)"
                    :key="tag"
                    class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                  >
                    {{ tag }}
                  </span>
                </div>

                <!-- 底部信息 -->
                <div class="flex items-center justify-between text-sm text-gray-500">
                  <div class="flex items-center gap-4">
                    <span class="flex items-center gap-1">
                      <Download class="w-4 h-4" />
                      {{ skill.download_count || 0 }}
                    </span>
                    <span v-if="skill.rating" class="flex items-center gap-1">
                      <Star class="w-4 h-4 text-yellow-400" />
                      {{ skill.rating }}
                    </span>
                  </div>
                  <button
                    @click="handleDownload(skill.id)"
                    class="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 text-sm font-medium"
                  >
                    查看详情
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 分页 -->
          <div v-if="totalPages > 1" class="flex justify-center space-x-2 mt-8">
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              上一页
            </button>
            
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              :class="[
                'px-3 py-2 rounded-lg transition-colors duration-200',
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
              class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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
  Filter
} from 'lucide-vue-next'
import { useSkillsStore } from '@/stores/skills'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const skillsStore = useSkillsStore()
const authStore = useAuthStore()

// 状态管理
const searchQuery = ref('')
const selectedCategory = ref('')
const sortBy = ref('createdAt')
const currentPage = ref(1)
const itemsPerPage = ref(12)

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
const totalCount = computed(() => skillsStore.totalCount)
const totalPages = computed(() => Math.ceil(totalCount.value / itemsPerPage.value))

// 带统计的分类列表
const categoriesWithCount = computed(() => {
  return categories.value.map(category => ({
    ...category,
    count: skills.value.filter(skill => skill.category_id === category.id).length
  }))
})

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
 * 获取分类图标
 * 返回与分类名称对应的图标组件，用于左侧分类与右侧标题展示。
 * 当传入的分类名称未匹配时，降级为默认图标。
 * @param {string} categoryName - 分类名称（如“前端开发”、“UI设计”等）
 * @returns {any} 对应的 lucide 图标组件
 */
const getCategoryIcon = (categoryName: string) => {
  const iconMap: Record<string, any> = {
    '前端开发': Code,
    'UI设计': Palette,
    '数据分析': Database,
    '产品管理': Settings,
    'default': Code
  }
  return iconMap[categoryName] || iconMap.default
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
 * 加载技能数据
 */
const loadSkills = async () => {
  await skillsStore.fetchSkills()
}

/**
 * 处理搜索
 */
const handleSearch = () => {
  currentPage.value = 1
  // 这里可以实现搜索逻辑
}

/**
 * 选择分类
 */
const selectCategory = (category: string) => {
  selectedCategory.value = selectedCategory.value === category ? '' : category
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
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
const handleDownload = (skillId: string) => {
  if (!authStore.isAuthenticated) {
    if (confirm('请先登录以下载技能')) {
      authStore.signInWithGitHub()
    }
    return
  }
  
  router.push(`/skills/${skillId}`)
}

onMounted(async () => {
  // 加载分类数据
  await skillsStore.fetchCategories()
  // 加载技能数据
  await loadSkills()
})
</script>

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