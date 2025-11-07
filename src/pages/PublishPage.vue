/**
 * 技能发布页面
 * 允许用户发布新的技能资源
 */
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 页面头部 -->
    <div class="bg-white shadow-sm">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 class="text-2xl font-bold text-gray-900">发布技能</h1>
        <p class="text-gray-600 mt-1">分享你的技能，帮助更多人学习和成长</p>
      </div>
    </div>
    
    <!-- 主要内容 -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 未登录提示 -->
      <div v-if="!authStore.isAuthenticated" class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
        <div class="flex items-center space-x-3">
          <AlertCircle class="w-6 h-6 text-yellow-600" />
          <div>
            <h3 class="text-lg font-medium text-yellow-800">请先登录</h3>
            <p class="text-yellow-700 mt-1">登录后即可发布技能</p>
          </div>
        </div>
        <button
          @click="authStore.signInWithGitHub()"
          class="mt-4 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors duration-200"
        >
          GitHub 登录
        </button>
      </div>
      
      <!-- 发布表单 -->
      <div v-else class="bg-white rounded-lg shadow-sm p-6">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- 技能标题 -->
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
              技能标题 *
            </label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              required
              placeholder="输入技能标题"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p class="mt-1 text-sm text-gray-500">简洁明了地描述你的技能</p>
          </div>
          
          <!-- 技能分类 -->
          <div>
            <label for="category" class="block text-sm font-medium text-gray-700 mb-2">
              技能分类 *
            </label>
            <select
              id="category"
              v-model="form.category"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">选择分类</option>
              <option
                v-for="category in categories"
                :key="category.id"
                :value="category.name"
              >
                {{ category.name }}
              </option>
            </select>
          </div>
          
          <!-- 技能描述 -->
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
              技能描述 *
            </label>
            <textarea
              id="description"
              v-model="form.description"
              required
              rows="3"
              placeholder="详细描述你的技能"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
            <p class="mt-1 text-sm text-gray-500">让其他人了解你的技能内容和价值</p>
          </div>
          
          <!-- 详细内容 -->
          <div>
            <label for="content" class="block text-sm font-medium text-gray-700 mb-2">
              详细内容
            </label>
            <textarea
              id="content"
              v-model="form.content"
              rows="6"
              placeholder="提供更详细的技能说明、使用场景等"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
          </div>
          
          <!-- 标签 -->
          <div>
            <label for="tags" class="block text-sm font-medium text-gray-700 mb-2">
              标签
            </label>
            <input
              id="tags"
              v-model="tagInput"
              @keyup.enter.prevent="addTag"
              type="text"
              placeholder="输入标签后按回车添加"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div v-if="form.tags.length > 0" class="mt-2 flex flex-wrap gap-2">
              <span
                v-for="(tag, index) in form.tags"
                :key="index"
                class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {{ tag }}
                <button
                  @click="removeTag(index)"
                  type="button"
                  class="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            </div>
            <p class="mt-1 text-sm text-gray-500">添加相关标签，帮助其他人找到你的技能</p>
          </div>
          
          <!-- 文件上传 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              技能文件 *
            </label>
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors duration-200">
              <div v-if="!selectedFile">
                <Upload class="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p class="text-gray-600 mb-2">点击选择文件或拖拽文件到此处</p>
                <p class="text-sm text-gray-500">支持 ZIP, PDF, DOC, DOCX 格式，最大 10MB</p>
                <input
                  ref="fileInput"
                  @change="handleFileSelect"
                  type="file"
                  accept=".zip,.pdf,.doc,.docx"
                  class="hidden"
                />
                <button
                  @click="selectFile"
                  type="button"
                  class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  选择文件
                </button>
              </div>
              <div v-else class="space-y-2">
                <FileText class="w-12 h-12 text-blue-600 mx-auto mb-2" />
                <p class="font-medium text-gray-900">{{ selectedFile.name }}</p>
                <p class="text-sm text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
                <button
                  @click="removeFile"
                  type="button"
                  class="text-red-600 hover:text-red-700 text-sm"
                >
                  移除文件
                </button>
              </div>
            </div>
          </div>
          
          <!-- 提交按钮 -->
          <div class="flex justify-end space-x-4">
            <button
              @click="resetForm"
              type="button"
              class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              重置
            </button>
            <button
              type="submit"
              :disabled="isSubmitting || !isFormValid"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {{ isSubmitting ? '发布中...' : '发布技能' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Upload, FileText, AlertCircle } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useSkillsStore } from '@/stores/skills'
import { supabase, type Category } from '@/lib/supabase'

const router = useRouter()
const authStore = useAuthStore()
const skillsStore = useSkillsStore()

// 状态管理
const categories = ref<Category[]>([])
const selectedFile = ref<File | null>(null)
const isSubmitting = ref(false)
const tagInput = ref('')

// 表单数据
const form = ref({
  title: '',
  category: '',
  description: '',
  content: '',
  tags: [] as string[]
})

// 文件输入引用
const fileInput = ref<HTMLInputElement>()

/**
 * 表单验证
 */
const isFormValid = computed(() => {
  return (
    form.value.title.trim() &&
    form.value.category &&
    form.value.description.trim() &&
    selectedFile.value
  )
})

/**
 * 加载分类数据
 */
const loadCategories = async () => {
  await skillsStore.fetchCategories()
  categories.value = skillsStore.categories
}

/**
 * 选择文件
 */
const selectFile = () => {
  fileInput.value?.click()
}

/**
 * 处理文件选择
 */
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    // 验证文件类型
    const allowedTypes = ['application/zip', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      alert('不支持的文件格式')
      return
    }
    
    // 验证文件大小 (10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      alert('文件大小不能超过10MB')
      return
    }
    
    selectedFile.value = file
  }
}

/**
 * 移除文件
 */
const removeFile = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

/**
 * 格式化文件大小
 */
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 添加标签
 */
const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !form.value.tags.includes(tag)) {
    form.value.tags.push(tag)
    tagInput.value = ''
  }
}

/**
 * 移除标签
 */
const removeTag = (index: number) => {
  form.value.tags.splice(index, 1)
}

/**
 * 重置表单
 */
const resetForm = () => {
  form.value = {
    title: '',
    category: '',
    description: '',
    content: '',
    tags: []
  }
  selectedFile.value = null
  tagInput.value = ''
}

/**
 * 提交表单
 */
const handleSubmit = async () => {
  if (!isFormValid.value || isSubmitting.value) return
  
  isSubmitting.value = true
  
  try {
    let fileUrl = ''
    
    // 上传文件
    if (selectedFile.value) {
      const fileName = `${Date.now()}-${selectedFile.value.name}`
      const { data, error } = await supabase.storage
        .from('skills')
        .upload(fileName, selectedFile.value)
      
      if (error) throw error
      
      fileUrl = data.path
    }
    
    // 创建技能
    const { error } = await supabase.from('skills').insert({
      title: form.value.title.trim(),
      category: form.value.category,
      description: form.value.description.trim(),
      content: form.value.content.trim(),
      tags: form.value.tags,
      file_url: fileUrl,
      file_size: selectedFile.value ? formatFileSize(selectedFile.value.size) : '',
      user_id: authStore.user.id
    })
    
    if (error) throw error
    
    // 成功提示
    alert('技能发布成功！')
    
    // 重置表单
    resetForm()
    
    // 跳转到技能列表
    router.push('/skills')
  } catch (err) {
    console.error('Submit error:', err)
    alert('发布失败，请稍后重试')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  loadCategories()
})
</script>