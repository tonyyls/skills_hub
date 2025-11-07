/**
 * 技能列表页面
 * 包含搜索、筛选、分页等功能
 */
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 页面头部 -->
    <div class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">技能资源</h1>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            发现和学习各种技能，从编程开发到设计创意，从数据分析到产品运营
          </p>
        </div>
        
        <!-- 搜索和筛选 -->
        <div class="flex flex-col md:flex-row gap-4 mb-6">
          <!-- 搜索框 -->
          <div class="flex-1 relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              v-model="searchQuery"
              @input="handleSearch"
              @keyup.enter="performSearch"
              type="text"
              placeholder="搜索技能..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <!-- 分类筛选 -->
          <div class="relative">
            <select
              v-model="selectedCategory"
              @change="handleCategoryChange"
              class="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">所有分类</option>
              <option
                v-for="category in categories"
                :key="category.id"
                :value="category.name"
              >
                {{ category.name }}
              </option>
            </select>
            <ChevronDown class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>
          
          <!-- 排序 -->
          <div class="relative">
            <select
              v-model="sortBy"
              @change="handleSortChange"
              class="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="createdAt">最新发布</option>
              <option value="downloads">下载最多</option>
              <option value="rating">评分最高</option>
              <option value="title">名称排序</option>
            </select>
            <ChevronDown class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>
        </div>
        
        <!-- 标签筛选 -->
        <div class="flex flex-wrap gap-2">
          <span class="text-sm text-gray-600 py-1">热门标签:</span>
          <button
            v-for="tag in popularTags"
            :key="tag"
            @click="selectTag(tag)"
            :class="[
              'px-3 py-1 rounded-full text-sm transition-colors duration-200',
              selectedTag === tag
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            {{ tag }}
          </button>
        </div>
      </div>
    </div>

    <!-- 技能列表 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">加载中...</p>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-600">{{ error }}</p>
        <button
          @click="loadSkills"
          class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
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
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          重置筛选
        </button>
      </div>
      
      <!-- 技能网格 -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <SkillCard
          v-for="skill in skills"
          :key="skill.id"
          :skill="skill"
          @download="handleDownload"
        />
      </div>
      
      <!-- 分页 -->
      <div v-if="totalPages > 1" class="flex justify-center space-x-2">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
              ? 'bg-blue-600 text-white'
              : 'border border-gray-300 hover:bg-gray-50'
          ]"
        >
          {{ page }}
        </button>
        
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search, ChevronDown } from 'lucide-vue-next'
import { useSkillsStore } from '@/stores/skills'
import { useAuthStore } from '@/stores/auth'
import SkillCard from '@/components/SkillCard.vue'

const route = useRoute()
const router = useRouter()
const skillsStore = useSkillsStore()
const authStore = useAuthStore()

// 状态管理
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedTag = ref('')
const sortBy = ref('createdAt')
const currentPage = ref(1)
const itemsPerPage = ref(12)

// 计算属性
const skills = computed(() => skillsStore.skills)
const categories = computed(() => skillsStore.categories)
const isLoading = computed(() => skillsStore.isLoading)
const error = computed(() => skillsStore.error)
const totalCount = computed(() => skillsStore.totalCount)
const totalPages = computed(() => Math.ceil(totalCount.value / itemsPerPage.value))

// 热门标签
const popularTags = computed(() => {
  const allTags = skills.value.flatMap(skill => skill.tags)
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .map(([tag]) => tag)
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
 * 加载技能数据
 */
const loadSkills = async () => {
  await skillsStore.fetchSkills(
    currentPage.value,
    searchQuery.value,
    selectedCategory.value,
    selectedTag.value,
    sortBy.value,
    itemsPerPage.value
  )
}

/**
 * 处理搜索
 */
const handleSearch = () => {
  currentPage.value = 1
  loadSkills()
}

/**
 * 执行搜索
 */
const performSearch = () => {
  handleSearch()
}

/**
 * 处理分类变化
 */
const handleCategoryChange = () => {
  currentPage.value = 1
  loadSkills()
}

/**
 * 处理排序变化
 */
const handleSortChange = () => {
  currentPage.value = 1
  loadSkills()
}

/**
 * 选择标签
 */
const selectTag = (tag: string) => {
  selectedTag.value = selectedTag.value === tag ? '' : tag
  currentPage.value = 1
  loadSkills()
}

/**
 * 跳转到指定页面
 */
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadSkills()
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
  selectedTag.value = ''
  sortBy.value = 'createdAt'
  currentPage.value = 1
  loadSkills()
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

/**
 * 从URL参数初始化筛选条件
 */
const initializeFromRoute = () => {
  const { search, category, tag, page } = route.query
  
  if (search) searchQuery.value = search as string
  if (category) selectedCategory.value = category as string
  if (tag) selectedTag.value = tag as string
  if (page) currentPage.value = parseInt(page as string) || 1
}

// 监听路由变化
watch(() => route.query, () => {
  initializeFromRoute()
  loadSkills()
})

onMounted(async () => {
  // 初始化筛选条件
  initializeFromRoute()
  
  // 加载分类数据
  await skillsStore.fetchCategories()
  
  // 加载技能数据
  await loadSkills()
})
</script>