/**
 * 用户Profile页面
 * 展示用户个人信息和发布的技能
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
          @click="loadProfile"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          重试
        </button>
      </div>
    </div>
    
    <!-- Profile内容 -->
    <div v-else-if="profile" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Profile头部 -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between">
          <!-- 用户信息 -->
          <div class="flex items-center space-x-4 mb-4 md:mb-0">
            <img
              :src="profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random`"
              :alt="profile.name"
              class="w-20 h-20 rounded-full"
            />
            <div>
              <h1 class="text-2xl font-bold text-gray-900">{{ profile.name }}</h1>
              <p class="text-gray-600">{{ profile.email }}</p>
              <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span>加入于 {{ formatDate(profile.createdAt) }}</span>
                <span>•</span>
                <span>{{ userSkills.length }} 个技能</span>
              </div>
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="flex space-x-3">
            <button
              @click="editProfile"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              编辑资料
            </button>
            <button
              @click="authStore.signOut()"
              class="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              退出登录
            </button>
          </div>
        </div>
        
        <!-- 个人简介 -->
        <div v-if="profile.bio" class="mt-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">个人简介</h3>
          <p class="text-gray-700">{{ profile.bio }}</p>
        </div>
      </div>
      
      <!-- 统计信息 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow-sm p-6 text-center">
          <div class="text-3xl font-bold text-blue-600 mb-2">{{ userSkills.length }}</div>
          <div class="text-gray-600">发布技能</div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6 text-center">
          <div class="text-3xl font-bold text-green-600 mb-2">{{ totalDownloads }}</div>
          <div class="text-gray-600">总下载数</div>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6 text-center">
          <div class="text-3xl font-bold text-yellow-600 mb-2">{{ averageRating }}</div>
          <div class="text-gray-600">平均评分</div>
        </div>
      </div>
      
      <!-- 技能列表 -->
      <div class="bg-white rounded-lg shadow-sm">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">我的技能</h2>
        </div>
        
        <div v-if="userSkills.length === 0" class="p-12 text-center">
          <Code class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">还没有发布技能</h3>
          <p class="text-gray-600 mb-4">开始分享你的第一个技能吧！</p>
          <router-link
            to="/publish"
            class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            发布技能
          </router-link>
        </div>
        
        <div v-else class="divide-y divide-gray-200">
          <div
            v-for="skill in userSkills"
            :key="skill.id"
            class="p-6 hover:bg-gray-50 transition-colors duration-200"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-3 mb-2">
                  <h3 class="text-lg font-semibold text-gray-900">{{ skill.title }}</h3>
                  <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                    {{ skill.category }}
                  </span>
                </div>
                <p class="text-gray-600 mb-3">{{ skill.description }}</p>
                <div class="flex items-center space-x-4 text-sm text-gray-500">
                  <span class="flex items-center space-x-1">
                    <Download class="w-4 h-4" />
                    <span>{{ skill.downloads }}</span>
                  </span>
                  <span class="flex items-center space-x-1">
                    <Star class="w-4 h-4" />
                    <span>{{ skill.rating }}</span>
                  </span>
                  <span>{{ formatDate(skill.createdAt) }}</span>
                </div>
              </div>
              
              <div class="flex space-x-2 ml-4">
                <router-link
                  :to="`/skills/${skill.id}`"
                  class="text-blue-600 hover:text-blue-700 px-3 py-1 rounded text-sm"
                >
                  查看
                </router-link>
                <button
                  @click="editSkill(skill)"
                  class="text-gray-600 hover:text-gray-700 px-3 py-1 rounded text-sm"
                >
                  编辑
                </button>
                <button
                  @click="deleteSkill(skill)"
                  class="text-red-600 hover:text-red-700 px-3 py-1 rounded text-sm"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 未登录状态 -->
    <div v-else class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <User class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 class="text-xl font-semibold text-gray-900 mb-2">请先登录</h2>
        <p class="text-gray-600 mb-4">登录后查看个人资料</p>
        <button
          @click="authStore.signInWithGitHub()"
          class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          GitHub 登录
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Code, Download, Star, AlertCircle, User } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useSkillsStore } from '@/stores/skills'
import { supabase, type Skill, type UserProfile } from '@/lib/supabase'

const router = useRouter()
const authStore = useAuthStore()
const skillsStore = useSkillsStore()

// 状态管理
const profile = ref<UserProfile | null>(null)
const userSkills = ref<Skill[]>([])
const isLoading = ref(false)
const error = ref('')

// 计算属性
const totalDownloads = computed(() => {
  return userSkills.value.reduce((total, skill) => total + skill.downloads, 0)
})

const averageRating = computed(() => {
  if (userSkills.value.length === 0) return '0.0'
  const totalRating = userSkills.value.reduce((total, skill) => total + skill.rating, 0)
  return (totalRating / userSkills.value.length).toFixed(1)
})

/**
 * 加载用户资料
 */
const loadProfile = async () => {
  if (!authStore.user) {
    return
  }
  
  isLoading.value = true
  error.value = ''
  
  try {
    // 获取用户资料
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authStore.user.id)
      .single()
    
    if (profileError) throw profileError
    
    profile.value = profileData
    
    // 获取用户发布的技能
    const { data: skillsData, error: skillsError } = await supabase
      .from('skills')
      .select(`
        *,
        author:user_id (
          id,
          name,
          avatar
        )
      `)
      .eq('user_id', authStore.user.id)
      .order('created_at', { ascending: false })
    
    if (skillsError) throw skillsError
    
    userSkills.value = skillsData.map(item => ({
      ...item,
      author: Array.isArray(item.author) ? item.author[0] : item.author
    }))
  } catch (err) {
    error.value = '加载失败，请稍后重试'
    console.error('Load profile error:', err)
  } finally {
    isLoading.value = false
  }
}

/**
 * 编辑资料
 */
const editProfile = () => {
  // 这里可以实现编辑资料的功能
  alert('编辑资料功能开发中...')
}

/**
 * 编辑技能
 */
const editSkill = (skill: Skill) => {
  router.push(`/publish?skill=${skill.id}`)
}

/**
 * 删除技能
 */
const deleteSkill = async (skill: Skill) => {
  if (!confirm(`确定要删除技能 "${skill.title}" 吗？`)) {
    return
  }
  
  try {
    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('id', skill.id)
    
    if (error) throw error
    
    // 重新加载数据
    await loadProfile()
    alert('技能已删除')
  } catch (err) {
    console.error('Delete skill error:', err)
    alert('删除失败，请稍后重试')
  }
}

/**
 * 格式化日期
 */
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    loadProfile()
  }
})
</script>