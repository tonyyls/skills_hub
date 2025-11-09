<template>
  <div class="space-y-6">
    <!-- 页面标题与列表类型切换（标题居左，切换居右，与其他管理页一致） -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
      <h2 class="text-lg font-semibold leading-tight text-gray-900">用户管理</h2>
      <div class="inline-flex items-center rounded-md bg-gray-100 p-1">
        <button
          type="button"
          :class="['px-3 py-1.5 text-sm rounded-md', activeTab === 'registered' ? 'bg-white shadow text-gray-900' : 'text-gray-700 hover:text-gray-900']"
          @click="switchTab('registered')"
        >注册用户</button>
        <button
          type="button"
          :class="['px-3 py-1.5 text-sm rounded-md', activeTab === 'admins' ? 'bg-white shadow text-gray-900' : 'text-gray-700 hover:text-gray-900']"
          @click="switchTab('admins')"
        >管理员用户</button>
      </div>
    </div>
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
      <div class="flex flex-col sm:flex-row gap-2">
        <!-- 搜索框（与分类页一致的尺寸与样式） -->
        <div class="relative">
          <input
            v-model="searchQuery"
            @keyup.enter="loadUsers"
            type="text"
            :placeholder="activeTab === 'registered' ? '搜索用户名、邮箱...' : '搜索管理员用户名、邮箱...'"
            class="pl-9 pr-8 py-1.5 w-full sm:w-56 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <!-- 清除按钮：有内容时显示 -->
          <button
            v-if="searchQuery"
            type="button"
            @click="clearSearch"
            class="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600"
            title="清除"
            aria-label="清除"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
        <!-- 刷新按钮（统一 lucide-vue-next 图标风格） -->
        <button
          type="button"
          @click="loadUsers"
          title="刷新"
          aria-label="刷新"
          class="bg-gray-100 text-gray-800 px-3 py-1.5 text-sm rounded-md hover:bg-gray-200 transition-colors inline-flex items-center justify-center"
        >
          <RefreshCw class="h-4 w-4" />
        </button>
        <!-- 新建管理员（普通用户需通过 GitHub 登录，不支持手工添加） -->
        <button
          v-if="activeTab === 'admins'"
          @click="showCreateModal = true"
          class="bg-orange-600 text-white px-3 py-1.5 text-sm rounded-md hover:bg-orange-700 transition-colors flex items-center gap-1.5"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          新建管理员
        </button>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户名</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">邮箱</th>
              <th v-if="activeTab === 'admins'" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">角色</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ activeTab === 'registered' ? '注册时间' : '最后登录时间' }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="loading">
              <td colspan="6" class="px-6 py-8 text-center">
                <div class="inline-flex items-center gap-2">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                  <span class="text-gray-600">加载中...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="error">
              <td colspan="6" class="px-6 py-4 text-center text-red-600">{{ error }}</td>
            </tr>
            <tr v-else-if="users.length === 0">
              <td colspan="6" class="px-6 py-4 text-center text-gray-500">暂无数据</td>
            </tr>
            <tr v-else v-for="user in users" :key="user.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ user.username }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ user.email }}
              </td>
              <td v-if="activeTab === 'admins'" class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'"
                >
                  {{ user.role === 'super_admin' ? '超级管理员' : '管理员' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                >
                  {{ user.is_active ? '激活' : '停用' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ activeTab === 'registered' ? formatDateTime(user.created_at) : formatDateTime(user.last_login_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center space-x-2">
                  <button
                    @click="editUser(user)"
                    class="text-orange-600 hover:text-orange-700 inline-flex items-center"
                    title="编辑"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="deleteUser(user)"
                    class="text-red-600 hover:text-red-700 inline-flex items-center"
                    title="删除"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 创建/编辑用户模态框（对齐分类管理样式） -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <!-- 模态框头部 -->
        <div class="px-6 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ showEditModal ? '编辑用户' : '新建用户' }}
          </h3>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 模态框内容区域 -->
        <div class="flex-1 overflow-y-auto p-6">
          <!-- 顶部错误提示 -->
          <div v-if="error" class="mb-3 text-sm text-red-600">{{ error }}</div>
          <form @submit.prevent="saveUser">
            <!-- 基本信息区域 -->
            <div class="bg-gray-50 rounded-lg p-3 mb-5">
              <h4 class="text-base font-medium text-gray-900 mb-3">基本信息（{{ activeTab === 'registered' ? '注册用户' : '管理员' }}）</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">用户名 <span class="text-red-500">*</span></label>
                  <input
                    v-model="form.username"
                    type="text"
                    class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    required
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">邮箱 <span class="text-red-500">*</span></label>
                  <input
                    v-model="form.email"
                    type="email"
                    class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    required
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">密码 <span class="text-red-500">*</span></label>
                  <input
                    v-model="form.password"
                    type="password"
                    class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    :required="!showEditModal"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">确认密码 <span class="text-red-500">*</span></label>
                  <input
                    v-model="form.confirmPassword"
                    type="password"
                    class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    :required="!showEditModal"
                  >
                  <div v-if="passwordError" class="mt-1 text-xs text-red-600">{{ passwordError }}</div>
                </div>
              </div>
            </div>

            <!-- 权限配置区域 -->
            <div class="bg-blue-50 rounded-lg p-3 mb-5">
              <h4 class="text-base font-medium text-gray-900 mb-3">权限配置</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">角色</label>
                  <select
                    v-model="form.role"
                    class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  >
                    <template v-if="activeTab === 'registered'">
                      <option value="user">普通用户</option>
                      <option value="admin">管理员</option>
                      <option value="super_admin">超级管理员</option>
                    </template>
                    <template v-else>
                      <option value="admin">管理员</option>
                      <option value="super_admin">超级管理员</option>
                    </template>
                  </select>
                </div>
                <div class="flex items-center">
                  <input
                    v-model="form.is_active"
                    type="checkbox"
                    class="rounded border-gray-300 text-orange-600 focus:ring-orange-500 h-4 w-4"
                  >
                  <label class="ml-2 block text-sm font-medium text-gray-700">是否激活</label>
                </div>
              </div>
            </div>

            <!-- 底部操作按钮 -->
            <div class="flex justify-end gap-2">
              <button
                type="button"
                @click="closeModal"
                class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                取消
              </button>
              <button
                type="submit"
                :disabled="!canSave"
                :class="['px-3 py-1.5 text-sm font-medium text-white rounded-md transition-colors', canSave ? 'bg-orange-600 hover:bg-orange-700' : 'bg-orange-300 cursor-not-allowed']"
              >
                保存
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 自定义删除确认模态框 -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">确认删除</h3>
          <p class="text-sm text-gray-700">确定要删除用户
            <span class="font-semibold text-gray-900">"{{ deleteTarget?.username }}"</span> 吗？此操作不可恢复。</p>
          <div class="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              @click="cancelDelete"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              取消
            </button>
            <button
              type="button"
              @click="confirmDelete"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              确认删除
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { RefreshCw, X } from 'lucide-vue-next'

interface User {
  id: string
  username: string
  email: string
  role: 'user' | 'admin' | 'super_admin'
  is_active: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
}

/**
 * 管理员用户类型（admin_users 表）
 */
interface AdminUser {
  id: string
  username: string
  email: string
  role: 'admin' | 'super_admin'
  is_active: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
}

const users = ref<User[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')

/**
 * 清除搜索关键字并重新加载用户列表。
 * 当输入框有内容时显示清除图标，点击后置空并触发加载。
 */
const clearSearch = (): void => {
  if (!searchQuery.value) return
  searchQuery.value = ''
  loadUsers()
}

/**
 * 当前标签页：
 * - registered：注册用户（auth.users + user_profiles）
 * - admins：管理员用户（admin_users）
 */
const activeTab = ref<'registered' | 'admins'>('registered')

const authStore = useAuthStore()
const router = useRouter()
const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingUser = ref<(User | AdminUser) | null>(null)
const showDeleteConfirm = ref(false)
const deleteTarget = ref<(User | AdminUser) | null>(null)

const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'user' as 'user' | 'admin' | 'super_admin',
  is_active: true
})

/**
 * 格式化日期时间
 */
const formatDateTime = (dateString: string | null): string => {
  if (!dateString) return '从未登录'
  return new Date(dateString).toLocaleString('zh-CN')
}

/**
 * 加载用户列表，支持搜索与列表类型切换。
 * - registered: 调用 `/api/admin/users`
 * - admins: 调用 `/api/admin/admin-users`
 * - 处理 401：清除令牌并跳转登录。
 * - 网络错误与中断（ERR_ABORTED）进行一次重试。
 */
const loadUsers = async (): Promise<void> => {
  loading.value = true
  error.value = null
  try {
    const token = localStorage.getItem('admin_token')
    const q = searchQuery.value.trim()
    const base = activeTab.value === 'registered' ? '/api/admin/users' : '/api/admin/admin-users'
    const url = q ? `${base}?q=${encodeURIComponent(q)}` : base
    const doFetch = async () => fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })
    let res: Response
    try {
      res = await doFetch()
    } catch (e: any) {
      // 遇到网络中断，尝试一次重试
      await new Promise(r => setTimeout(r, 300))
      res = await doFetch()
    }
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('admin_token')
        error.value = '登录会话已过期，请重新登录'
        router.push('/admin/login')
        return
      }
      const data = await res.json().catch(() => ({}))
      throw new Error(data?.message || `加载用户失败 (${res.status})`)
    }
    const data = await res.json()
    users.value = (data.items || [])
  } catch (err: any) {
    console.error('加载用户失败:', err)
    error.value = err?.message || '加载用户失败'
  } finally {
    loading.value = false
  }
}

/**
 * 打开编辑模态，填充表单。
 * @param user 当前行用户（根据标签页类型可能为注册用户或管理员用户）
 */
const editUser = (user: User | AdminUser) => {
  editingUser.value = user
  form.value = {
    username: user.username,
    email: user.email,
    password: '',
    confirmPassword: '',
    role: user.role as any,
    is_active: user.is_active
  }
  showEditModal.value = true
}

/**
 * 触发删除确认弹窗。
 * 仅展示确认，不立即执行删除，防止误删。
 * @param user 待删除用户
 */
/**
 * 触发删除确认弹窗。
 * @param user 当前行用户
 */
const deleteUser = (user: User | AdminUser): void => {
  deleteTarget.value = user
  showDeleteConfirm.value = true
}

/**
 * 取消删除，关闭确认弹窗并清理状态。
 */
const cancelDelete = (): void => {
  showDeleteConfirm.value = false
  deleteTarget.value = null
}

/**
 * 确认删除用户。
 * - 处理 401：清除令牌并跳转登录。
 * - 对 204 无响应体做兼容，删除成功后刷新列表。
 */
/**
 * 确认删除用户。
 * 根据当前标签页调用不同后端：
 * - registered: DELETE /api/admin/users/:id
 * - admins: DELETE /api/admin/admin-users/:id
 */
const confirmDelete = async (): Promise<void> => {
  const target = deleteTarget.value
  if (!target) {
    showDeleteConfirm.value = false
    return
  }
  try {
    const token = localStorage.getItem('admin_token')
    const base = activeTab.value === 'registered' ? '/api/admin/users' : '/api/admin/admin-users'
    const res = await fetch(`${base}/${target.id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('admin_token')
        error.value = '登录会话已过期，请重新登录'
        router.push('/admin/login')
        return
      }
      const data = await res.json().catch(() => ({}))
      throw new Error(data?.message || `删除用户失败 (${res.status})`)
    }
    // 兼容 200 JSON 成功响应
    await res.json().catch(() => ({}))
    await loadUsers()
  } catch (err) {
    console.error('删除用户失败:', err)
  } finally {
    showDeleteConfirm.value = false
    deleteTarget.value = null
  }
}

/**
 * 保存用户：编辑或创建。
 * - 新建：密码与确认密码必填、至少8位且一致。
 * - 编辑：密码可选，但若填写需与确认密码一致且至少8位。
 * - 处理401：清除令牌并跳转登录。
 * - 显示后端错误信息到模态。
 */
/**
 * 保存用户（编辑或创建）。
 * 根据当前标签页调用不同后端：
 * - registered: POST/PUT /api/admin/users
 * - admins: POST/PUT /api/admin/admin-users
 */
const saveUser = async (): Promise<void> => {
  try {
    error.value = null

    const pwd = (form.value.password || '').trim()
    const cpwd = (form.value.confirmPassword || '').trim()

    if (showEditModal.value) {
      // 编辑模式：密码可选，但若填写需成对填写并校验
      if ((pwd && !cpwd) || (!pwd && cpwd)) {
        error.value = '请同时填写密码与确认密码'
        return
      }
      if (pwd && cpwd) {
        if (pwd.length < 8) {
          error.value = '密码至少8位'
          return
        }
        if (pwd !== cpwd) {
          error.value = '两次密码不一致'
          return
        }
      }
    } else {
      // 新建模式：密码必填
      if (!pwd || !cpwd) {
        error.value = '密码和确认密码为必填项'
        return
      }
      if (pwd.length < 8) {
        error.value = '密码至少8位'
        return
      }
      if (pwd !== cpwd) {
        error.value = '两次密码不一致'
        return
      }
    }

    const token = localStorage.getItem('admin_token')
    const payload: Record<string, any> = {
      username: form.value.username,
      email: form.value.email,
      role: form.value.role,
      is_active: form.value.is_active
    }
    // 编辑时仅在填写密码的情况下更新密码；新建时必须携带密码
    if (showEditModal.value) {
      if (pwd && cpwd) payload.password = pwd
    } else {
      payload.password = pwd
    }

    const base = activeTab.value === 'registered' ? '/api/admin/users' : '/api/admin/admin-users'
    if (showEditModal.value && editingUser.value) {
      const res = await fetch(`${base}/${editingUser.value.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('admin_token')
          error.value = '登录会话已过期，请重新登录'
          router.push('/admin/login')
          return
        }
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || `更新用户失败 (${res.status})`)
      }
    } else {
      const res = await fetch(base, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('admin_token')
          error.value = '登录会话已过期，请重新登录'
          router.push('/admin/login')
          return
        }
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || `创建用户失败 (${res.status})`)
      }
    }
    closeModal()
    await loadUsers()
  } catch (err: any) {
    console.error('保存用户失败:', err)
    error.value = err?.message || '保存用户失败'
  }
}

/**
 * 关闭用户编辑/创建模态并重置表单。
 */
const closeModal = (): void => {
  showCreateModal.value = false
  showEditModal.value = false
  editingUser.value = null
  form.value = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: activeTab.value === 'registered' ? 'user' : 'admin',
    is_active: true
  }
}

onMounted(() => {
  loadUsers()
})

/**
 * 切换标签页并重新加载数据。
 * @param tab 标签页类型
 */
const switchTab = (tab: 'registered' | 'admins') => {
  activeTab.value = tab
  // 重置列表与错误
  users.value = []
  error.value = null
  // 重置搜索占位与表单默认角色
  form.value.role = tab === 'registered' ? 'user' : 'admin'
  loadUsers()
}

/**
 * 密码字段校验（新建必填，编辑可选）。
 * 返回错误信息用于表单实时提示；无错误返回 null。
 */
const passwordError = computed<string | null>(() => {
  const pwd = (form.value.password || '').trim()
  const cpwd = (form.value.confirmPassword || '').trim()
  if (showEditModal.value) {
    if ((pwd && !cpwd) || (!pwd && cpwd)) return '请同时填写密码与确认密码'
    if (pwd && cpwd) {
      if (pwd.length < 8) return '密码至少8位'
      if (pwd !== cpwd) return '两次密码不一致'
    }
    return null
  }
  // 新建用户：必填
  if (!pwd || !cpwd) return '密码和确认密码为必填项'
  if (pwd.length < 8) return '密码至少8位'
  if (pwd !== cpwd) return '两次密码不一致'
  return null
})

/**
 * 是否可保存（用户名/邮箱必填 + 密码规则）。
 */
const canSave = computed(() => {
  const base = !!form.value.username && !!form.value.email
  const pwd = (form.value.password || '').trim()
  const cpwd = (form.value.confirmPassword || '').trim()
  if (showEditModal.value) {
    if (pwd || cpwd) return base && !passwordError.value
    return base
  }
  return base && !passwordError.value
})
</script>