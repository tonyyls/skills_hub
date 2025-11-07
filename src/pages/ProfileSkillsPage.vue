/**
 * 个人收藏技能页面
 * 与 /skills 页面保持一致的布局风格和对齐方式
 */
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 页面标题区域 - 与 /skills 页面保持一致的对齐方式 -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">我的收藏</h1>
            <p class="mt-2 text-gray-600">管理你收藏的技能资源</p>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <Heart class="w-4 h-4" />
            <span>{{ favoriteSkills.length }} 个技能</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容区域 - 与 /skills 页面保持一致的对齐方式 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- 加载状态 -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="i in 6" :key="i" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div class="flex-1 space-y-3">
              <div class="h-5 bg-gray-200 rounded w-3/4"></div>
              <div class="h-4 bg-gray-200 rounded w-full"></div>
              <div class="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="favoriteSkills.length === 0" class="text-center py-16">
        <div class="max-w-md mx-auto w-full">
          <div class="w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart class="w-12 h-12 text-orange-500" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">还没有收藏任何技能</h3>
          <p class="text-gray-600 mb-8">去发现一些有趣的技能，点击收藏按钮即可在这里查看</p>
          <router-link 
            to="/skills"
            class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Compass class="w-5 h-5" />
            探索技能
          </router-link>
        </div>
      </div>

      <!-- 技能列表：使用与 /skills 页面一致的网格布局 -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div 
          v-for="skill in favoriteSkills" 
          :key="skill.id"
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-orange-200 transition-all duration-200 group"
        >
          <!-- 技能头部信息 -->
          <div class="flex items-start gap-4 mb-4">
            <div class="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <component 
                :is="getIconComponent(skill.category)" 
                class="w-6 h-6 text-orange-600"
              />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                {{ skill.title }}
              </h3>
              <p class="text-sm text-gray-600 mt-1">{{ skill.category || '未分类' }}</p>
            </div>
            <!-- 取消收藏按钮 -->
            <button
              @click="removeFavorite(skill.id)"
              class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 flex-shrink-0"
              title="取消收藏"
            >
              <Heart class="w-5 h-5 fill-current" />
            </button>
          </div>

          <!-- 技能描述 -->
          <p class="text-gray-700 text-sm mb-4 line-clamp-2">{{ skill.description }}</p>

          <!-- 技能统计信息 -->
          <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div class="flex items-center gap-1">
              <Download class="w-4 h-4" />
              <span>{{ skill.download_count || 0 }}</span>
            </div>
            <div class="flex items-center gap-1">
              <Star class="w-4 h-4" />
              <span>{{ skill.rating || 0 }}</span>
            </div>
            <div class="flex items-center gap-1">
              <Calendar class="w-4 h-4" />
              <span>{{ formatDate(skill.created_at) }}</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex gap-2">
            <router-link
              :to="`/skills/${skill.id}`"
              class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors duration-200 font-medium text-sm"
            >
              <Eye class="w-4 h-4" />
              查看详情
            </router-link>
            <button
              @click="quickDownload(skill)"
              class="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm"
            >
              <Download class="w-4 h-4" />
              下载
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'
import { Heart, Compass, Download, Star, Calendar, Eye, Code, Palette, BookOpen, Settings, Globe } from 'lucide-vue-next'

interface Skill {
  id: string
  title: string
  description: string
  category?: string
  download_count?: number
  rating?: number
  created_at: string
}

const auth = useAuthStore()
const loading = ref(true)
const favoriteSkills = ref<Skill[]>([])

/**
 * 获取收藏的技能列表
 * 从用户收藏表中查询当前用户收藏的所有技能
 */
const loadFavoriteSkills = async () => {
  loading.value = true
  try {
    const userId = auth.user?.id
    if (!userId) {
      favoriteSkills.value = []
      return
    }

    // 查询用户收藏的技能
    const { data, error } = await supabase
      .from('user_favorites')
      .select(`
        skill:skills(
          id,
          title,
          description,
          category,
          download_count,
          rating,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('加载收藏失败:', error)
      return
    }

    // 提取技能数据
    favoriteSkills.value = (data || []).map(item => item.skill).filter(Boolean)
  } catch (error) {
    console.error('加载收藏出错:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 移除收藏
 * @param skillId - 技能ID
 */
const removeFavorite = async (skillId: string) => {
  try {
    const userId = auth.user?.id
    if (!userId) return

    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('skill_id', skillId)

    if (error) {
      console.error('取消收藏失败:', error)
      return
    }

    // 从列表中移除
    favoriteSkills.value = favoriteSkills.value.filter(skill => skill.id !== skillId)
  } catch (error) {
    console.error('取消收藏出错:', error)
  }
}

/**
 * 快速下载技能
 * @param skill - 技能对象
 */
const quickDownload = (skill: Skill) => {
  // 这里可以实现下载逻辑
  console.log('下载技能:', skill.title)
  // 可以触发实际的下载操作
}

/**
 * 根据分类获取图标组件
 * @param category - 技能分类
 * @returns 图标组件
 */
const getIconComponent = (category: string) => {
  const iconMap: Record<string, any> = {
    '前端开发': Code,
    '设计': Palette,
    '后端开发': Settings,
    '移动开发': Globe,
    '数据科学': BookOpen,
    '默认': Code
  }
  
  // 根据分类关键词匹配图标
  if (category.includes('前端') || category.includes('JavaScript')) return Code
  if (category.includes('设计') || category.includes('UI')) return Palette
  if (category.includes('后端') || category.includes('服务器')) return Settings
  if (category.includes('移动') || category.includes('App')) return Globe
  if (category.includes('数据') || category.includes('AI')) return BookOpen
  
  return iconMap[category] || Code
}

/**
 * 格式化日期
 * @param dateString - 日期字符串
 * @returns 格式化后的日期
 */
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays}天前`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`
  return `${Math.floor(diffDays / 365)}年前`
}

// 页面加载时获取收藏数据
onMounted(() => {
  loadFavoriteSkills()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>