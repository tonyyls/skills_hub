<template>
  <div class="min-h-screen bg-[#F7F3EF]">

    <div class="relative z-10">
      <!-- 顶部 Banner（统一为首页风格：深色背景 + 渐变强调） -->
      <section class="relative py-16 lg:py-20 overflow-hidden">
        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold text-[#333] mb-6 leading-tight">
            发现优秀的
            <span class="bg-gradient-to-r from-[#FF6A3A] to-[#FF7A45] bg-clip-text text-transparent">Skills</span>
            技能资源
          </h1>
          <p class="text-lg md:text-xl text-[#666] mb-10 max-w-3xl mx-auto leading-relaxed">
            Skills Hub 是一个第三方技能市场，共收录了 10086 个技能。
          </p>

          <!-- 搜索框：与首页一致的现代化样式 -->
          <div class="max-w-2xl mx-auto">
            <div class="relative">
              <div class="relative bg-white border border-[#E5E5E5] rounded-full p-1">
                <div class="flex items-center">
                  <Search class="w-5 h-5 text-gray-400 ml-4" />
                  <input
                    v-model="searchQuery"
                    @keyup.enter="handleSearch"
                    type="text"
                    placeholder="关键词搜索"
                    class="flex-1 bg-transparent border-none outline-none px-4 py-3 text-gray-800 placeholder-[#9AA0A6] text-base md:text-lg"
                    v-select-all-shortcut
                  />
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

      

      <!-- 筛选标签 -->
      <div class="flex justify-center mt-8 mb-12 px-4">
        <div class="flex flex-wrap gap-3">
          <button
            v-for="filter in filters"
            :key="filter.value"
            @click="activeFilter = filter.value"
            :class="[
              'px-6 py-3 rounded-full text-sm font-medium transition-all duration-300',
              activeFilter === filter.value
                ? 'bg-gradient-to-r from-[#FF6A3A] to-[#FF7A45] text-white shadow-sm'
                : 'bg-white text-[#555] border border-[#E5E5E5] hover:bg-[#FFF5EF] hover:text-[#333]'
            ]"
          >
            <component :is="filter.icon" class="h-4 w-4 inline mr-2" v-if="filter.icon" />
            {{ filter.label }}
          </button>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="max-w-7xl mx-auto px-4 pb-16">
        <!-- 区域标题 -->
        <div class="flex justify-between items-center mb-8">
          <h2 class="text-2xl font-semibold text-[#444]">精选技能资源</h2>
          <router-link
            to="/skills"
            class="text-[#FF7A45] hover:text-[#ff8a55] transition-colors flex items-center gap-1"
          >
            查看全部
            <ChevronRight class="h-4 w-4" />
          </router-link>
        </div>

        <!-- 技能卡片网格 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div
            v-for="skill in filteredSkills"
            :key="skill.id"
            class="group bg-white border border-[#EEEEEE] rounded-xl p-6 hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden min-h-[280px] h-auto flex flex-col"
            @click="goToSkillDetail(skill.id)"
          >
            <!-- 卡片头部 -->
            <div class="flex justify-between items-start mb-4">
              <!-- 左侧：标题（允许收缩） + 精选徽章（不压缩） -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <h3
                    class="font-semibold text-gray-800 group-hover:text-[#FF7A45] transition-colors truncate min-w-0"
                    v-truncate-title="skill.title"
                  >
                    {{ skill.title }}
                  </h3>
                  <!-- 赞助商标签 -->
                  <span
                    v-if="skill.isSponsored"
                    class="inline-block px-2 py-1 bg-gradient-to-r from-[#FF7A45] to-[#FF6A3A] text-white text-xs rounded-full flex-shrink-0"
                  >
                    精选
                  </span>
                </div>
              </div>
              <!-- 收藏星标 -->
              <button
                @click.stop="toggleFavorite(skill.id)"
                class="text-gray-400 hover:text-yellow-400 transition-colors ml-2 flex-shrink-0"
              >
                <Star
                  :class="[
                    'h-5 w-5',
                    favorites.includes(skill.id) ? 'text-yellow-400 fill-current' : ''
                  ]"
                />
              </button>
            </div>

            <!-- 描述：限制为 5 行，超出省略 -->
            <p class="text-gray-600 text-sm line-clamp-5 mb-4">
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

            <!-- 底部信息 -->
            <div class="flex justify-between items-center text-xs text-[#888]">
              <span>{{ skill.category }}</span>
              <span>{{ skill.download_count }} 下载</span>
            </div>
          </div>
        </div>

        <!-- 加载更多 -->
        <div class="text-center mt-12">
          <button
            @click="loadMore"
            class="px-8 py-3 bg-gradient-to-r from-[#FF6A3A] to-[#FF7A45] text-white rounded-full hover:from-[#ff6e40] hover:to-[#ff8a55] transition-all duration-300 shadow-md"
          >
            加载更多
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, ArrowRight, ChevronRight, Star, Flame, Clock, Award, Download, Cloud, Shield } from 'lucide-vue-next'

const router = useRouter()

// 搜索查询
const searchQuery = ref('')

// MCP 服务器统计（示例展示用）
const serverCount = ref(16946)

// 收藏列表
const favorites = ref<string[]>([])

// 筛选器
const filters = [
  { value: 'today', label: '今日', icon: Clock },
  { value: 'featured', label: '精选', icon: Flame },
  { value: 'latest', label: '最新', icon: Award },
  { value: 'popular', label: '热门', icon: Download },
  { value: 'premium', label: '高级', icon: Shield },
  { value: 'free', label: '免费', icon: Cloud }
]

const activeFilter = ref('featured')

// 技能数据（模拟数据）
const skills = ref([
  {
    id: '1',
    title: 'Vue 3 组件开发指南',
    description: '深入学习Vue 3组件开发，包含Composition API、TypeScript集成等高级技巧，适合前端开发者进阶学习',
    category: '前端开发',
    download_count: 128,
    tags: ['Vue.js', 'TypeScript', '组件开发'],
    isSponsored: true
  },
  {
    id: '2',
    title: 'React Hooks 实战教程',
    description: '从零开始学习React Hooks，包含useState、useEffect、自定义Hook等核心概念和最佳实践',
    category: '前端开发',
    download_count: 256,
    tags: ['React', 'JavaScript', 'Hooks'],
    isSponsored: false
  },
  {
    id: '3',
    title: 'Figma UI设计系统',
    description: '构建完整的设计系统，包含颜色、字体、组件库等设计规范，提升设计效率和一致性',
    category: 'UI设计',
    download_count: 89,
    tags: ['Figma', '设计系统', 'UI'],
    isSponsored: true
  },
  {
    id: '4',
    title: 'Python数据分析实战',
    description: '使用Python进行数据分析，包含pandas、numpy、matplotlib等库的使用方法和实际案例',
    category: '数据分析',
    download_count: 167,
    tags: ['Python', '数据分析', '机器学习'],
    isSponsored: false
  },
  {
    id: '5',
    title: '产品经理实战手册',
    description: '从需求分析到产品上线的完整流程，适合初级产品经理学习和参考的实用指南',
    category: '产品管理',
    download_count: 203,
    tags: ['产品管理', '需求分析', '项目管理'],
    isSponsored: false
  },
  {
    id: '6',
    title: 'TypeScript高级技巧',
    description: '深入学习TypeScript高级特性，包含泛型、装饰器、模块系统等进阶内容',
    category: '前端开发',
    download_count: 342,
    tags: ['TypeScript', 'JavaScript', '高级技巧'],
    isSponsored: true
  },
  {
    id: '7',
    title: 'Docker容器化部署',
    description: '学习Docker容器化技术，包含镜像构建、容器编排、服务部署等实用技能',
    category: '云计算',
    download_count: 195,
    tags: ['Docker', '容器化', '部署'],
    isSponsored: false
  },
  {
    id: '8',
    title: 'Node.js后端开发',
    description: '完整的Node.js后端开发教程，包含Express框架、数据库操作、API设计等内容',
    category: '后端开发',
    download_count: 278,
    tags: ['Node.js', 'Express', '后端开发'],
    isSponsored: false
  }
])

// 过滤后的技能列表
const filteredSkills = computed(() => {
  let result = skills.value

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(skill =>
      skill.title.toLowerCase().includes(query) ||
      skill.description.toLowerCase().includes(query) ||
      skill.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  // 筛选器过滤
  switch (activeFilter.value) {
    case 'today':
      result = result.slice(0, 3)
      break
    case 'featured':
      result = result.filter(skill => skill.isSponsored)
      break
    case 'latest':
      result = result.slice().reverse()
      break
    case 'popular':
      result = result.slice().sort((a, b) => b.download_count - a.download_count)
      break
    case 'premium':
      result = result.filter(skill => skill.download_count > 200)
      break
    case 'free':
      result = result.filter(skill => skill.download_count < 150)
      break
  }

  return result
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

// 切换收藏
const toggleFavorite = (skillId: string) => {
  const index = favorites.value.indexOf(skillId)
  if (index > -1) {
    favorites.value.splice(index, 1)
  } else {
    favorites.value.push(skillId)
  }
  localStorage.setItem('favorites', JSON.stringify(favorites.value))
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
onMounted(() => {
  // 从本地存储加载收藏列表
  const savedFavorites = localStorage.getItem('favorites')
  if (savedFavorites) {
    favorites.value = JSON.parse(savedFavorites)
  }
})
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