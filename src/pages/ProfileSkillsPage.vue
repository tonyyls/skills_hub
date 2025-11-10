/**
 * 个人收藏技能页面
 * 与 /skills 页面保持一致的布局风格和对齐方式
 */
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 轻量提示：登录/操作反馈，与 /skills 保持一致 -->
    <div
      v-if="showToast"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg shadow z-50"
    >
      {{ toastText }}
    </div>
    <!-- 页面标题区域 - 与 /skills 页面保持一致的对齐方式 -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">我的收藏</h1>
            <p class="mt-2 text-gray-600">管理你收藏的技能资源</p>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <Star class="w-4 h-4 text-yellow-400 fill-current" />
            <span>已收藏 {{ favoriteSkills.length }} 个技能</span>
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
            <Star class="w-12 h-12 text-yellow-400 fill-current" />
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
          class="group bg-white border border-[#EEEEEE] rounded-xl p-6 hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col"
          @click="goToSkillDetail(skill.id)"
        >
          <!-- 技能头部信息 -->
          <div class="flex justify-between items-start mb-4">
            <div class="flex-1">
              <h3 class="font-semibold text-gray-800 group-hover:text-[#FF7A45] transition-colors line-clamp-2">
                {{ skill.title }}
              </h3>
            </div>
            <!-- 取消收藏按钮 -->
            <button
              @click.stop="removeFavorite(skill.id)"
              class="text-yellow-400 hover:text-yellow-500 p-2 rounded-lg transition-colors"
              title="取消收藏"
            >
              <Star class="w-5 h-5 fill-current" />
            </button>
          </div>

          <!-- 描述（三行截断，与首页一致） -->
          <p class="text-gray-600 text-sm line-clamp-3 mb-4">{{ skill.description }}</p>

          <!-- 标签（最多显示 3 个） -->
          <div class="flex flex-wrap gap-2 mb-4">
            <span
              v-for="tag in (skill.tags || []).slice(0, 3)"
              :key="typeof tag === 'string' ? tag : ''"
              class="px-2 py-1 bg-[#F4F4F4] text-[#666] text-xs rounded-full"
            >
              {{ tag }}
            </span>
          </div>

          <!-- 底部信息：左分类、右作者（与首页一致） -->
          <div class="mt-auto flex items-center justify-between text-gray-500 text-sm">
            <span>{{ getCategoryName(skill.category_id) || '未分类' }}</span>
            <span class="inline-flex items-center gap-2">
              <span>{{ (skill.author_name && skill.author_name.trim()) ? skill.author_name : '官方' }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSkillsStore } from '@/stores/skills'
import { supabase } from '@/lib/supabase'
import { Compass, Download, Star, Calendar, Eye, Code, Palette, BookOpen, Settings, Globe } from 'lucide-vue-next'

interface Skill {
  id: string
  title: string
  description: string
  /** 分类主键ID，与 categories.id 对齐 */
  category_id?: string
  download_count?: number
  rating?: number
  created_at: string
  tags?: string[] | null
  author_name?: string | null
}

const auth = useAuthStore()
const skillsStore = useSkillsStore()
const loading = ref(true)
const favoriteSkills = ref<Skill[]>([])
const showToast = ref(false)
const toastText = ref('')
const router = useRouter()

/**
 * 轻量提示：2秒自动消失
 * @param msg 提示文案
 */
const showToastMessage = (msg: string) => {
  toastText.value = msg
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 2000)
}

/**
 * 根据分类ID获取分类名称
 * 优先使用 store.categories，其次使用 store.categoryMap
 * @param categoryId 分类ID
 * @returns 分类名称
 */
const getCategoryName = (categoryId?: string): string => {
  if (!categoryId) return ''
  const byId = skillsStore.categories.find(c => c.id === categoryId)
  return byId?.name || skillsStore.categoryMap[categoryId] || ''
}

/**
 * 获取收藏的技能列表（两步查询，避免关系选择的列错误）。
 * 1) 查询 `user_favorites` 获取当前用户的收藏技能ID及收藏时间；
 * 2) 使用 `.in('id', ids)` 查询 `skills` 详情，并按收藏时间排序返回。
 * 参考：Supabase JS 文档 `.in` 过滤与选择 https://supabase.com/docs/reference/javascript/in
 */
const loadFavoriteSkills = async () => {
  loading.value = true
  try {
    const userId = auth.user?.id
    if (!userId) {
      favoriteSkills.value = []
      return
    }

    // 第一步：获取收藏的 skillId 列表（按收藏时间降序）
    const { data: favRows, error: favError } = await supabase
      .from('user_favorites')
      .select('skill_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (favError) {
      console.error('加载收藏失败:', favError)
      showToastMessage('加载收藏失败')
      return
    }

    const ids = (favRows || []).map(r => r.skill_id).filter(Boolean)
    if (ids.length === 0) {
      favoriteSkills.value = []
      return
    }

    // 第二步：查询技能详情
    const { data: skillsRows, error: skillsError } = await supabase
      .from('skills')
      .select('id, title:name, description, category_id, created_at')
      .in('id', ids)

    if (skillsError) {
      console.error('加载收藏详情失败:', skillsError)
      showToastMessage('加载收藏详情失败')
      return
    }

    // 根据收藏顺序排序技能结果
    const orderMap = new Map<string, number>()
    ids.forEach((id, idx) => orderMap.set(id, idx))
    const sorted = (skillsRows || []).slice().sort((a, b) => {
      return (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0)
    })
    favoriteSkills.value = sorted as Skill[]
  } catch (error) {
    console.error('加载收藏出错:', error)
    showToastMessage('加载收藏出现异常')
  } finally {
    loading.value = false
  }
}

/**
 * 跳转技能详情页
 * @param id 技能ID
 */
const goToSkillDetail = (id: string) => {
  router.push(`/skills/${id}`)
}

/**
 * 移除收藏
 * @param skillId - 技能ID
 */
/**
 * 取消收藏：从 Supabase `user_favorites` 删除记录并更新列表
 * 与 /skills 页面保持一致的服务端操作
 * @param skillId 技能ID
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
    showToastMessage('已取消收藏')
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
onMounted(async () => {
  // 确保分类数据已加载，用于通过 category_id 显示名称
  await skillsStore.fetchCategories()
  await loadFavoriteSkills()
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