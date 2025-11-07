/**
 * 技能详情页面
 * 展示技能详细信息、下载功能和相关推荐
 */
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">加载中...</p>
      </div>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <AlertCircle class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 class="text-xl font-semibold text-gray-900 mb-2">加载失败</h2>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button
          @click="loadSkill"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          重试
        </button>
      </div>
    </div>
    
    <!-- 技能详情 -->
    <div v-else-if="skill" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 返回按钮 -->
      <div class="mb-6">
        <button
          @click="goBack"
          class="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>返回技能列表</span>
        </button>
      </div>
      
      <!-- 主要内容 -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <!-- 头部信息 -->
        <div class="p-6 border-b border-gray-200">
          <div class="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
            <div class="flex-1">
              <div class="flex items-center space-x-3 mb-2">
                <span class="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  {{ skill.category }}
                </span>
                <div class="flex items-center space-x-1 text-yellow-500">
                  <Star class="w-4 h-4 fill-current" />
                  <span class="text-sm text-gray-600">{{ skill.rating }}</span>
                </div>
              </div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ skill.title }}</h1>
              <p class="text-gray-600">{{ skill.description }}</p>
            </div>
            
            <!-- 下载按钮 -->
            <div class="mt-4 md:mt-0 md:ml-6">
              <button
                @click="handleDownload"
                :disabled="isDownloading"
                class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
              >
                <Download class="w-5 h-5" />
                <span>{{ isDownloading ? '下载中...' : '下载资源' }}</span>
              </button>
              <p class="text-xs text-gray-500 mt-2 text-center">{{ skill.downloads }} 次下载</p>
            </div>
          </div>
          
          <!-- 作者信息 -->
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <img
                :src="skill.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(skill.author.name)}&background=random`"
                :alt="skill.author.name"
                class="w-10 h-10 rounded-full"
              />
              <div>
                <p class="font-medium text-gray-900">{{ skill.author.name }}</p>
                <p class="text-sm text-gray-500">{{ formatDate(skill.createdAt) }}</p>
              </div>
            </div>
            
            <div class="flex items-center space-x-4 text-sm text-gray-600">
              <span class="flex items-center space-x-1">
                <Download class="w-4 h-4" />
                <span>{{ skill.downloads }}</span>
              </span>
              <span class="flex items-center space-x-1">
                <Star class="w-4 h-4" />
                <span>{{ skill.rating }}</span>
              </span>
              <span>{{ skill.fileSize }}</span>
            </div>
          </div>
        </div>
        
        <!-- 标签 -->
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">标签</h3>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in skill.tags"
              :key="tag"
              class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
            >
              {{ tag }}
            </span>
          </div>
        </div>
        
        <!-- 详细描述 -->
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">详细介绍</h3>
          <div class="prose max-w-none text-gray-700">
            <p>{{ skill.description }}</p>
            <div v-if="skill.content" class="mt-4">
              <h4 class="text-md font-semibold text-gray-900 mb-2">内容说明</h4>
              <p>{{ skill.content }}</p>
            </div>
          </div>
        </div>
        
        <!-- 文件信息 -->
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">文件信息</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex justify-between">
              <span class="text-gray-600">文件大小:</span>
              <span class="font-medium">{{ skill.fileSize }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">下载次数:</span>
              <span class="font-medium">{{ skill.downloads }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">评分:</span>
              <span class="font-medium">{{ skill.rating }}/5.0</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">发布日期:</span>
              <span class="font-medium">{{ formatDate(skill.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 相关推荐 -->
      <div v-if="relatedSkills.length > 0" class="mt-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">相关推荐</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkillCard
            v-for="relatedSkill in relatedSkills"
            :key="relatedSkill.id"
            :skill="relatedSkill"
            @download="handleRelatedDownload"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Download, Star, AlertCircle } from 'lucide-vue-next'
import { useSkillsStore } from '@/stores/skills'
import { useAuthStore } from '@/stores/auth'
import { supabase, type Skill } from '@/lib/supabase'
import SkillCard from '@/components/SkillCard.vue'

const route = useRoute()
const router = useRouter()
const skillsStore = useSkillsStore()
const authStore = useAuthStore()

// 状态管理
const skill = ref<Skill | null>(null)
const isLoading = ref(false)
const error = ref('')
const isDownloading = ref(false)
const relatedSkills = ref<Skill[]>([])

/**
 * 加载技能详情
 */
const loadSkill = async () => {
  const skillId = route.params.id as string
  if (!skillId) {
    error.value = '无效的技能ID'
    return
  }
  
  isLoading.value = true
  error.value = ''
  
  try {
    // 获取技能详情
    const skillData = await skillsStore.fetchSkillById(skillId)
    if (skillData) {
      skill.value = skillData
      
      // 加载相关推荐
      await loadRelatedSkills(skillData)
    } else {
      error.value = '技能不存在或已删除'
    }
  } catch (err) {
    error.value = '加载失败，请稍后重试'
    console.error('Load skill error:', err)
  } finally {
    isLoading.value = false
  }
}

/**
 * 加载相关推荐
 */
const loadRelatedSkills = async (currentSkill: Skill) => {
  try {
    const { data, error } = await supabase
      .from('skills')
      .select(`
        *,
        author:user_id (
          id,
          name,
          avatar
        )
      `)
      .neq('id', currentSkill.id)
      .or(`category.eq.${currentSkill.category},tags.cs.{${currentSkill.tags.join(',')}}`)
      .limit(3)
    
    if (!error && data) {
      relatedSkills.value = data.map(item => ({
        ...item,
        author: Array.isArray(item.author) ? item.author[0] : item.author
      }))
    }
  } catch (err) {
    console.error('Load related skills error:', err)
  }
}

/**
 * 处理下载
 */
const handleDownload = async () => {
  if (!skill.value || isDownloading.value) return
  
  if (!authStore.isAuthenticated) {
    if (confirm('请先登录以下载技能')) {
      authStore.signInWithGitHub()
    }
    return
  }
  
  isDownloading.value = true
  
  try {
    // 模拟下载过程
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 增加下载次数
    await skillsStore.incrementDownloadCount(skill.value.id)
    
    // 创建下载链接
    const link = document.createElement('a')
    link.href = skill.value.fileUrl || '#'
    link.download = `${skill.value.title}.zip`
    link.click()
    
    // 显示成功消息
    alert('下载成功！')
  } catch (err) {
    console.error('Download error:', err)
    alert('下载失败，请稍后重试')
  } finally {
    isDownloading.value = false
  }
}

/**
 * 处理相关技能下载
 */
const handleRelatedDownload = (skillId: string) => {
  router.push(`/skills/${skillId}`)
}

/**
 * 返回上一页
 */
const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/skills')
  }
}

/**
 * 格式化日期
 */
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  loadSkill()
})
</script>