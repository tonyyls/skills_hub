/**
 * 首页组件
 * 包含Banner区域、搜索功能、分类展示、技能列表等
 */
<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <!-- Hero Section -->
    <section class="relative py-24 lg:py-32 overflow-hidden">
      <!-- Background Elements -->
      <div class="absolute inset-0">
        <div class="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute top-40 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
        <div class="absolute bottom-20 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 4s;"></div>
      </div>
      
      <!-- Content -->
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <div class="mb-8">
            <div class="inline-flex items-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-6 py-2 mb-8">
              <Sparkles class="w-5 h-5 text-blue-400 mr-2"/>
              <span class="text-blue-300 text-sm font-medium">技能分享平台</span>
            </div>
          </div>
          
          <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
            发现 & 分享
            <span class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">专业技能</span>
          </h1>
          
          <p class="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            连接全球开发者、设计师和创作者，共同构建技能共享生态
          </p>
          
          <div class="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <router-link
              to="/explore"
              class="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold text-white hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
            >
              <span>探索技能</span>
              <ArrowRight class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"/>
            </router-link>
            
            <button
              v-if="!authStore.isAuthenticated"
              @click="authStore.signInWithGitHub()"
              class="group relative inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl font-semibold text-white hover:bg-white/20 transition-all duration-300"
            >
              <Github class="w-5 h-5 mr-2"/>
              <span>GitHub 登录</span>
            </button>
            
            <!-- 发布技能入口已关闭：仅管理员后台发布 -->
            <!-- 管理后台入口：仅管理员登录可见 -->
            <router-link
              v-else-if="authStore.adminUser"
              to="/admin"
              class="group relative inline-flex items-center justify-center px-8 py-4 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-xl font-semibold text-white hover:bg-green-500/30 transition-all duration-300"
            >
              <Plus class="w-5 h-5 mr-2"/>
              <span>进入管理后台</span>
            </router-link>
          </div>
          
          <!-- Stats -->
          <div class="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div class="text-center">
              <div class="text-3xl md:text-4xl font-bold text-white mb-2">500+</div>
              <div class="text-gray-400 text-sm">技能资源</div>
            </div>
            <div class="text-center">
              <div class="text-3xl md:text-4xl font-bold text-white mb-2">1K+</div>
              <div class="text-gray-400 text-sm">开发者</div>
            </div>
            <div class="text-center">
              <div class="text-3xl md:text-4xl font-bold text-white mb-2">100+</div>
              <div class="text-gray-400 text-sm">技术分类</div>
            </div>
            <div class="text-center">
              <div class="text-3xl md:text-4xl font-bold text-white mb-2">24/7</div>
              <div class="text-gray-400 text-sm">在线支持</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Search Section -->
    <section class="py-16 relative">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-white mb-6">
            快速找到你需要的
            <span class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">专业技能</span>
          </h2>
          <p class="text-lg text-gray-400 max-w-2xl mx-auto">
            从编程开发到设计创意，从数据分析到产品运营，一站式搜索所有技能资源
          </p>
        </div>
        
        <!-- Search Container -->
        <div class="max-w-2xl mx-auto">
          <div class="relative group">
            <div class="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-30 group-hover:opacity-50"></div>
            
            <div class="relative bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-1">
              <div class="flex items-center">
                <Search class="w-5 h-5 text-gray-400 ml-4" />
                <input
                  v-model="searchQuery"
                  @input="handleSearch"
                  @keyup.enter="performSearch"
                  @focus="showSuggestions = true"
                  @blur="setTimeout(() => { showSuggestions = false }, 150)"
                  type="text"
                  placeholder="搜索技能、技术或工具..."
                  class="flex-1 bg-transparent border-none outline-none px-4 py-4 text-white placeholder-gray-400 text-lg"
                />
                <button
                  @click="performSearch"
                  class="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 mr-1"
                >
                  搜索
                </button>
              </div>
            </div>
          </div>
          
          <!-- Search Suggestions -->
          <div
            v-if="showSuggestions && searchSuggestions.length > 0"
            class="mt-4 bg-slate-800/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-2xl z-10"
          >
            <div
              v-for="suggestion in searchSuggestions"
              :key="suggestion"
              @click="selectSuggestion(suggestion)"
              class="px-6 py-3 hover:bg-white/10 cursor-pointer text-gray-300 hover:text-white transition-all duration-200 first:rounded-t-xl last:rounded-b-xl flex items-center"
            >
              <Search class="w-4 h-4 mr-3 text-blue-400"/>
              <span class="font-medium">{{ suggestion }}</span>
            </div>
          </div>
          
          <!-- Popular Searches -->
          <div class="mt-8 text-center">
            <p class="text-gray-400 text-sm mb-4">热门搜索：</p>
            <div class="flex flex-wrap justify-center gap-3">
              <button
                v-for="tag in ['React', 'Vue', 'Python', 'UI Design', '数据分析']"
                :key="tag"
                @click="searchQuery = tag; performSearch()"
                class="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 text-sm"
              >
                {{ tag }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="py-20 relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-white mb-6">
            探索热门
            <span class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">技能领域</span>
          </h2>
          <p class="text-lg text-gray-400 max-w-2xl mx-auto">
            从编程开发到创意设计，发现最适合你的学习方向和发展路径
          </p>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="category in categories"
            :key="category.id"
            @click="selectCategory(category.name)"
            class="group relative bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 cursor-pointer hover:border-blue-400/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
          >
            <!-- Background Glow Effect -->
            <div class="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div class="relative z-10">
              <div class="w-14 h-14 mx-auto mb-5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <component :is="getCategoryIcon(category.name)" class="w-7 h-7 text-white" />
              </div>
              
              <h3 class="text-lg font-semibold text-white mb-3 text-center group-hover:text-blue-300 transition-colors duration-300">
                {{ category.name }}
              </h3>
              
              <p class="text-gray-400 text-sm text-center leading-relaxed">
                {{ category.description }}
              </p>
              
              <div class="mt-4 flex justify-center items-center text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span class="text-sm mr-2">探索更多</span>
                <ArrowRight class="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
        
        <!-- View All Categories Button -->
        <div class="text-center mt-12">
          <button
            @click="$router.push('/skills')"
            class="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
          >
            查看全部分类
            <ArrowRight class="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </section>

    <!-- Featured Skills Section -->
    <section class="py-20 relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-white mb-6">
            热门
            <span class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">技能推荐</span>
          </h2>
          <p class="text-lg text-gray-400 max-w-2xl mx-auto">
            发现社区中最受欢迎和高质量的专业技能资源
          </p>
        </div>
        
        <div v-if="skillsStore.isLoading" class="text-center py-20">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p class="mt-6 text-gray-400 text-lg">加载中...</p>
        </div>
        
        <div v-else-if="skillsStore.error" class="text-center py-20">
          <div class="text-red-400 text-lg mb-6">{{ skillsStore.error }}</div>
          <button
            @click="loadSkills"
            class="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 font-semibold"
          >
            重试
          </button>
        </div>
        
        <div v-else-if="skills.length === 0" class="text-center py-20">
          <Search class="w-20 h-20 text-gray-600 mx-auto mb-6" />
          <p class="text-gray-500 text-lg">暂无技能资源</p>
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="skill in skills.slice(0, 6)"
            :key="skill.id"
            class="group relative bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-blue-400/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
          >
            <!-- Background Glow Effect -->
            <div class="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div class="relative z-10">
              <!-- Header -->
              <div class="flex items-center justify-between mb-5">
                <div class="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-white/10">
                  <Code class="w-5 h-5 text-blue-400" />
                </div>
                <div class="flex items-center text-yellow-400">
                  <Star class="w-4 h-4 fill-current" />
                  <span class="ml-1 text-sm font-semibold">{{ skill.rating || 4.8 }}</span>
                </div>
              </div>
              
              <!-- Content -->
              <h3 class="text-lg font-semibold text-white mb-3 group-hover:text-blue-300 transition-colors duration-300 line-clamp-2">
                {{ skill.title }}
              </h3>
              
              <p class="text-gray-400 text-sm mb-5 leading-relaxed line-clamp-3">
                {{ skill.description }}
              </p>
              
              <!-- Footer -->
              <div class="flex items-center justify-between">
                <div class="flex items-center text-gray-400 text-xs">
                  <Download class="w-3 h-3 mr-1" />
                  <span>{{ skill.downloads || 0 }} 下载</span>
                </div>
                
                <button
                  @click="handleDownload(skill.id)"
                  class="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold rounded-md hover:shadow-md hover:shadow-blue-500/25 transition-all duration-300"
                >
                  获取
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- View More Button -->
        <div class="text-center mt-12">
          <button
            @click="$router.push('/skills')"
            class="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
          >
            浏览更多技能
            <ArrowRight class="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, ArrowRight, Code, Palette, BarChart3, Briefcase, Sparkles, Users, BookOpen, Award, Zap } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useSkillsStore } from '@/stores/skills'
import { supabase, type Category } from '@/lib/supabase'
import SkillCard from '@/components/SkillCard.vue'

const router = useRouter()
const authStore = useAuthStore()
const skillsStore = useSkillsStore()

const searchQuery = ref('')
const showSuggestions = ref(false)
const searchSuggestions = ref<string[]>([])

const skills = computed(() => skillsStore.skills)
const categories = computed(() => skillsStore.categories)

const stats = [
  { icon: BookOpen, label: '技能资源', value: '10K+', description: '优质学习资源' },
  { icon: Users, label: '开发者', value: '50K+', description: '活跃社区成员' },
  { icon: Award, label: '技术分类', value: '20+', description: '专业领域覆盖' },
  { icon: Zap, label: '在线支持', value: '24/7', description: '实时技术交流' }
]

/**
 * 获取分类图标
 */
const getCategoryIcon = (categoryName: string) => {
  const iconMap: Record<string, any> = {
    '编程开发': Code,
    '设计创意': Palette,
    '数据分析': BarChart3,
    '产品运营': Briefcase,
    '其他': Sparkles
  }
  return iconMap[categoryName] || Sparkles
}

/**
 * 处理搜索输入
 */
const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    showSuggestions.value = false
    return
  }
  
  try {
    const { data, error } = await supabase
      .from('skills')
      .select('title')
      .ilike('title', `%${searchQuery.value}%`)
      .limit(5)
    
    if (!error && data) {
      searchSuggestions.value = data.map(item => item.title)
      showSuggestions.value = true
    }
  } catch (error) {
    console.error('Search suggestions error:', error)
  }
}

/**
 * 选择搜索建议
 */
const selectSuggestion = (suggestion: string) => {
  searchQuery.value = suggestion
  showSuggestions.value = false
  performSearch()
}

/**
 * 执行搜索
 */
const performSearch = () => {
  showSuggestions.value = false
  if (searchQuery.value.trim()) {
    router.push(`/skills?search=${encodeURIComponent(searchQuery.value)}`)
  }
}

/**
 * 选择分类
 */
const selectCategory = (categoryName: string) => {
  router.push(`/skills?category=${encodeURIComponent(categoryName)}`)
}

/**
 * 加载技能数据
 */
const loadSkills = async () => {
  await skillsStore.fetchSkills(1, '', '')
}

/**
 * 处理技能下载
 */
const handleDownload = (skillId: string) => {
  if (!authStore.isAuthenticated) {
    // 提示用户登录
    if (confirm('请先登录以下载技能')) {
      authStore.signInWithGitHub()
    }
    return
  }
  
  // 跳转到技能详情页进行下载
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
/* 自定义样式 */

/* 自定义滚动条样式 */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
}

/* 动画效果 */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.float-animation {
  animation: float 3s ease-in-out infinite;
}

@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
  }
  50% {
    box-shadow: 0 0 40px rgba(59, 130, 246, 0.8);
  }
}

.glow-animation {
  animation: glow 2s ease-in-out infinite;
}
</style>