<template>
  <div class="space-y-6">
    <!-- 头部 -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex items-start justify-between">
        <div class="flex items-center space-x-4">
          <img
            :src="(adminProfile.avatar_url || adminProfile.avatar || defaultAvatar)"
            alt="avatar"
            class="w-20 h-20 rounded-full border"
          />
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ adminProfile.username || adminProfile.name || '管理员' }}</h1>
            <p class="text-gray-600" v-if="adminProfile.email">{{ adminProfile.email }}</p>
            <div class="flex items-center space-x-3 mt-2 text-sm">
              <span class="px-2 py-1 rounded-full bg-orange-100 text-orange-700">管理员</span>
              <span class="text-gray-500">创建于 {{ formatDate(adminProfile.created_at || adminProfile.createdAt) }}</span>
            </div>
          </div>
        </div>
        <div class="flex space-x-2">
          <button @click="openEditModal" class="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700">编辑资料</button>
        </div>
      </div>
    </div>

    <!-- 账号状态与说明 -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-3">账号状态</h2>
      <div class="flex items-center space-x-3">
        <span class="px-2 py-1 rounded-full" :class="adminProfile.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'">
          {{ adminProfile.is_active ? '已启用' : '未启用' }}
        </span>
        <span class="text-sm text-gray-500">角色：{{ adminProfile.role || 'admin' }}</span>
      </div>
      <p class="text-sm text-gray-500 mt-3">此页面仅限管理员账号使用，用于管理个人基本信息。头像上传依赖 Supabase Storage，可选。</p>
    </div>

    <!-- 编辑资料模态框 -->
    <div v-if="showEditModal" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-lg rounded-lg shadow-lg">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">编辑管理员资料</h3>
        </div>
        <div class="p-6 space-y-4">
          <!-- 头像上传 -->
          <div>
            <label class="block text-sm text-gray-700 mb-1">头像</label>
            <div class="flex items-center space-x-4">
              <img :src="avatarPreview || form.avatar_url || defaultAvatar" alt="avatar" class="w-16 h-16 rounded-full border" />
              <input type="file" accept="image/*" @change="handleAvatarChange" />
            </div>
          </div>
          <div>
            <label class="block text-sm text-gray-700 mb-1">用户名</label>
            <input v-model="form.username" type="text" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="请输入用户名" />
          </div>
          <div>
            <label class="block text-sm text-gray-700 mb-1">邮箱</label>
            <input v-model="form.email" type="email" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="请输入邮箱" />
          </div>
        </div>
        <div class="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button @click="showEditModal = false" class="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50">取消</button>
          <button @click="saveProfile" :disabled="saving" class="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-60">{{ saving ? '保存中...' : '保存' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'

const authStore = useAuthStore()

// 管理员资料视图模型
const adminProfile = ref<any>({})
const isLoading = ref(false)
const error = ref<string | null>(null)

// 编辑状态
const showEditModal = ref(false)
const saving = ref(false)
const form = ref<{ username: string; email: string; avatar_url: string }>({ username: '', email: '', avatar_url: '' })
const avatarPreview = ref<string>('')

const defaultAvatar = computed(() => {
  const name = adminProfile.value?.username || adminProfile.value?.name || 'Admin'
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
})

/**
 * 加载管理员个人资料。
 * 优先使用 Pinia 的 adminUser；若不存在则调用 /api/admin/me。
 * 401 时清除令牌并跳转登录页。
 */
const loadAdminProfile = async (): Promise<void> => {
  isLoading.value = true
  error.value = null
  try {
    // 优先使用已存在的管理员状态
    if (authStore.adminUser) {
      adminProfile.value = { ...authStore.adminUser }
      return
    }
    const token = localStorage.getItem('admin_token')
    const res = await fetch('/api/admin/me', {
      headers: {
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })
    if (res.status === 401) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      error.value = '登录状态已失效，请重新登录'
      return
    }
    if (!res.ok) {
      throw new Error(`加载失败 (${res.status})`)
    }
    const data = await res.json()
    adminProfile.value = data
    authStore.setAdminUser({
      id: data.id || 'admin',
      username: data.username || 'admin',
      email: data.email || '',
      role: 'admin',
      is_active: true,
      created_at: data.created_at || new Date().toISOString()
    })
  } catch (err) {
    console.error('加载管理员资料失败:', err)
    error.value = err instanceof Error ? err.message : '加载失败'
  } finally {
    isLoading.value = false
  }
}

/** 打开编辑模态并填充表单 */
const openEditModal = (): void => {
  if (!adminProfile.value) return
  form.value = {
    username: adminProfile.value.username || '',
    email: adminProfile.value.email || '',
    avatar_url: adminProfile.value.avatar_url || ''
  }
  showEditModal.value = true
}

/**
 * 处理头像选择与上传。
 * - 预览：URL.createObjectURL
 * - 上传：Supabase Storage `avatars` bucket
 */
const handleAvatarChange = async (e: Event): Promise<void> => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  avatarPreview.value = URL.createObjectURL(file)
  try {
    const url = await uploadAvatar(file)
    if (url) form.value.avatar_url = url
  } catch (err) {
    console.error('头像上传失败:', err)
    alert('头像上传失败，已使用本地预览')
  }
}

/**
 * 上传头像到 Supabase Storage。
 * @see https://supabase.com/docs/reference/javascript/storage-from-upload
 */
const uploadAvatar = async (file: File): Promise<string | null> => {
  const userId = authStore.adminUser?.id || 'admin'
  const filePath = `${userId}/${Date.now()}_${file.name}`
  const { data, error } = await supabase.storage.from('avatars').upload(filePath, file, { cacheControl: '3600', upsert: true })
  if (error) {
    console.error('Supabase 上传错误:', error)
    return null
  }
  const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(data.path)
  return publicUrlData.publicUrl || null
}

/**
 * 保存管理员资料。
 * - 调用 PUT /api/admin/users/:id 更新用户名/邮箱/头像
 * - 成功后同步更新 Pinia 与 localStorage，以便 /admin/me 返回的用户名不变时也能显示最新信息
 */
const saveProfile = async (): Promise<void> => {
  if (!authStore.adminUser) return
  saving.value = true
  try {
    const token = localStorage.getItem('admin_token')
    const res = await fetch(`/api/admin/users/${authStore.adminUser.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        username: form.value.username,
        email: form.value.email,
        avatar_url: form.value.avatar_url
      })
    })
    if (res.status === 401) {
      error.value = '登录状态已失效，请重新登录'
      return
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data?.message || `更新失败 (${res.status})`)
    }
    // 同步到状态与本地存储
    const next = {
      ...authStore.adminUser,
      username: form.value.username,
      email: form.value.email,
      avatar_url: form.value.avatar_url
    }
    authStore.setAdminUser(next as any)
    localStorage.setItem('admin_user', JSON.stringify(next))
    adminProfile.value = { ...next }
    showEditModal.value = false
  } catch (err) {
    console.error('保存管理员资料失败:', err)
    alert(err instanceof Error ? err.message : '保存失败')
  } finally {
    saving.value = false
  }
}

/** 日期格式化 */
const formatDate = (date?: string): string => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(async () => {
  const ok = authStore.checkAdminAuth()
  if (!ok) return
  await loadAdminProfile()
})
</script>

<style scoped>
</style>