<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
      <h2 class="text-xl font-semibold leading-tight text-gray-900">分类管理</h2>
      <div class="flex flex-col sm:flex-row gap-2">
        <!-- 搜索框（与技能页一致的尺寸与样式） -->
        <div class="relative">
          <input
            v-model="searchQuery"
            @keyup.enter="loadCategories"
            type="text"
            placeholder="搜索名称、描述、slug..."
            class="pl-9 pr-8 py-1.5 w-full sm:w-56 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            v-select-all-shortcut
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
          @click="loadCategories"
          title="刷新"
          aria-label="刷新"
          class="bg-gray-100 text-gray-800 px-3 py-1.5 text-sm rounded-md hover:bg-gray-200 transition-colors inline-flex items-center justify-center"
        >
          <RefreshCw class="h-4 w-4" />
        </button>
        <!-- 新建分类（与技能页一致的按钮尺寸与样式） -->
        <button
          @click="showCreateModal = true"
          class="bg-orange-600 text-white px-3 py-1.5 text-sm rounded-md hover:bg-orange-700 transition-colors flex items-center gap-1.5"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          新建分类
        </button>
      </div>
    </div>

    <!-- 分类列表 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              名称
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              标识（slug）
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              排序
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              状态
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              操作
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="loading">
              <td colspan="5" class="px-6 py-8 text-center">
                <div class="inline-flex items-center gap-2">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                  <span class="text-gray-600">加载中...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="error">
              <td colspan="5" class="px-6 py-4 text-center text-red-600">{{ error }}</td>
            </tr>
            <tr v-else-if="categories.length === 0">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500">暂无数据</td>
            </tr>
            <tr v-else v-for="category in categories" :key="category.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ category.name }}</div>
                <div class="text-sm text-gray-500">{{ category.name_en }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ category.slug }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ category.sort_order ?? 0 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="category.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                >
              {{ category.is_active ? '启用' : '停用' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center space-x-2">
                  <button
                    @click="editCategory(category)"
                    class="text-orange-600 hover:text-orange-700 inline-flex items-center"
                    title="编辑"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="deleteCategory(category)"
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

    <!-- 创建/编辑分类模态框（对齐技能管理样式） -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <!-- 模态框头部 -->
        <div class="px-6 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ showEditModal ? '编辑分类' : '新建分类' }}
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
          <form @submit.prevent="saveCategory">
            <!-- 基本信息区域 -->
            <div class="bg-gray-50 rounded-lg p-3 mb-5">
              <h4 class="text-base font-medium text-gray-900 mb-3">基本信息</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">名称 <span class="text-red-500">*</span></label>
                  <input
                    v-model="form.name"
                    type="text"
                    class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    required
                    v-select-all-shortcut
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">英文名称</label>
                  <input
                    v-model="form.name_en"
                    type="text"
                    class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    v-select-all-shortcut
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">标识（slug） <span class="text-red-500">*</span></label>
                  <div class="flex items-center gap-2">
                    <input
                      v-model="form.slug"
                      type="text"
                      class="flex-1 px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      required
                      v-select-all-shortcut
                    >
                    <button
                      type="button"
                      @click="generateSlugFromName"
                      class="bg-orange-600 text-white px-2 py-1.5 text-sm rounded-md hover:bg-orange-700 transition-colors"
                      title="根据英文名称生成标识"
                      aria-label="生成标识"
                    >
                      生成
                    </button>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">排序</label>
                  <input
                    v-model.number="form.sort_order"
                    type="number"
                    min="0"
                    class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  >
                </div>
              </div>
            </div>

            <!-- 描述区域 -->
            <div class="bg-green-50 rounded-lg p-3 mb-5">
              <h4 class="text-base font-medium text-gray-900 mb-3">描述</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">描述</label>
                  <textarea
                    v-model="form.description"
                    rows="3"
                    class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    v-select-all-shortcut
                  ></textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">英文描述</label>
                  <textarea
                    v-model="form.description_en"
                    rows="3"
                    class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    v-select-all-shortcut
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- 配置信息区域 -->
            <div class="bg-blue-50 rounded-lg p-3 mb-5">
              <h4 class="text-base font-medium text-gray-900 mb-3">配置信息</h4>
              <div class="flex items-center">
                <input
                  v-model="form.is_active"
                  type="checkbox"
                  class="rounded border-gray-300 text-orange-600 focus:ring-orange-500 h-4 w-4"
                >
                <label class="ml-2 block text-sm font-medium text-gray-700">是否启用</label>
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
                class="px-3 py-1.5 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 transition-colors"
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
          <p class="text-sm text-gray-700">确定要删除分类
            <span class="font-semibold text-gray-900">"{{ deleteTarget?.name }}"</span> 吗？此操作不可恢复。</p>
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

interface Category {
  id: string
  name: string
  name_en?: string
  slug: string
  description?: string
  description_en?: string
  is_active: boolean
  sort_order?: number
  created_at: string
}

const categories = ref<Category[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')

/**
 * 清除搜索关键字并重新加载分类列表。
 * 当输入框有内容时显示清除图标，点击后置空并触发加载。
 */
const clearSearch = (): void => {
  if (!searchQuery.value) return
  searchQuery.value = ''
  loadCategories()
}

const authStore = useAuthStore()
const router = useRouter()
const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingCategory = ref<Category | null>(null)
const showDeleteConfirm = ref(false)
const deleteTarget = ref<Category | null>(null)

const form = ref({
  name: '',
  name_en: '',
  slug: '',
  description: '',
  description_en: '',
  is_active: true,
  sort_order: 100
})

/**
 * 根据名称生成 slug 并写入到表单。
 * 规则：优先使用英文名称 `name_en`，否则退回中文名称 `name`；
 * - 转为小写；
 * - 去除首尾空格；
 * - 将连续空白替换为单个连字符 `-`；
 * - 去除非字母数字与连字符的字符（简单保守清理）。
 */
const generateSlugFromName = (): void => {
  const source = (form.value.name_en || form.value.name || '').trim()
  if (!source) {
    // 无来源则不写入，保持当前 slug
    return
  }
  // 规范化：小写、空白转连字符、清理非法字符、合并多重连字符
  const slug = source
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$|_/g, '')
  form.value.slug = slug
}

/**
 * 加载分类列表，支持搜索。
 * - 处理 401：清除令牌并跳转登录。
 * - 网络错误与中断（ERR_ABORTED）进行一次重试。
 */
const loadCategories = async (): Promise<void> => {
  loading.value = true
  error.value = null
  try {
    const token = localStorage.getItem('admin_token')
    const q = searchQuery.value.trim()
    const url = q ? `/api/admin/categories?q=${encodeURIComponent(q)}` : '/api/admin/categories'
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
      throw new Error(data?.message || `加载分类失败 (${res.status})`)
    }
    const data = await res.json()
    categories.value = data.items || []
  } catch (err: any) {
    console.error('加载分类失败:', err)
    error.value = err?.message || '加载分类失败'
  } finally {
    loading.value = false
  }
}

const editCategory = (category: Category) => {
  editingCategory.value = category
  form.value = {
    name: category.name,
    name_en: category.name_en || '',
    slug: category.slug,
    description: category.description || '',
    description_en: category.description_en || '',
    is_active: category.is_active,
    sort_order: typeof category.sort_order === 'number' ? category.sort_order : 100
  }
  showEditModal.value = true
}

/**
 * 删除分类。
 * - 处理 401：清除令牌并跳转登录。
 * - 对 204 无响应体的情况做兼容。
 * - 网络错误（如请求被中断）按失败提示但不中断后续刷新。
 */
/**
 * 触发删除确认弹窗。
 * 仅展示确认，不立即执行删除，防止误删。
 * @param category 待删除分类
 */
const deleteCategory = (category: Category): void => {
  deleteTarget.value = category
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
 * 确认删除分类。
 * - 处理 401：清除令牌并跳转登录。
 * - 对 204 无响应体做兼容，删除成功后刷新列表。
 */
const confirmDelete = async (): Promise<void> => {
  const target = deleteTarget.value
  if (!target) {
    showDeleteConfirm.value = false
    return
  }
  try {
    const token = localStorage.getItem('admin_token')
    const res = await fetch(`/api/admin/categories/${target.id}`, {
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
      throw new Error(data?.message || `删除分类失败 (${res.status})`)
    }
    // 兼容 200 JSON 成功响应
    await res.json().catch(() => ({}))
    await loadCategories()
  } catch (err) {
    console.error('删除分类失败:', err)
  } finally {
    showDeleteConfirm.value = false
    deleteTarget.value = null
  }
}

/**
 * 保存分类：编辑或创建
 */
/**
 * 保存分类：编辑或创建。
 * - 处理 401：清除令牌并跳转登录。
 */
const saveCategory = async (): Promise<void> => {
  try {
    const token = localStorage.getItem('admin_token')
    if (showEditModal.value && editingCategory.value) {
      const res = await fetch(`/api/admin/categories/${editingCategory.value.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(form.value)
      })
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('admin_token')
          error.value = '登录会话已过期，请重新登录'
          router.push('/admin/login')
          return
        }
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || `更新分类失败 (${res.status})`)
      }
    } else {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(form.value)
      })
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('admin_token')
          error.value = '登录会话已过期，请重新登录'
          router.push('/admin/login')
          return
        }
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || `创建分类失败 (${res.status})`)
      }
    }
    closeModal()
    await loadCategories()
  } catch (error) {
    console.error('保存分类失败:', error)
  }
}

/**
 * 关闭分类编辑/创建模态并重置表单。
 */
const closeModal = (): void => {
  showCreateModal.value = false
  showEditModal.value = false
  editingCategory.value = null
  form.value = {
    name: '',
    name_en: '',
    slug: '',
    description: '',
    description_en: '',
    is_active: true,
    sort_order: 100
  }
}

onMounted(() => {
  loadCategories()
})

/**
 * 是否可保存（基本校验）
 */
const canSave = computed(() => !!form.value.name && !!form.value.slug)
</script>