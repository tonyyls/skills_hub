<template>
  <div class="space-y-6">
    <!-- 页面标题和操作区域 -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
      <h2 class="text-xl font-semibold leading-tight text-gray-900">友情链接管理</h2>
      
      <!-- 添加链接按钮 -->
      <button
        @click="showCreateModal = true"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
      >
        <Plus class="mr-2 h-4 w-4" />
        添加链接
      </button>
    </div>

    <!-- 链接列表 -->
    <div class="bg-white shadow-sm rounded-lg overflow-hidden border">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">网站名称</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">链接地址</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">排序</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <!-- 加载中状态 -->
          <tr v-if="loading">
            <td colspan="5" class="px-6 py-8 text-center">
              <div class="inline-flex items-center gap-2">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                <span class="text-gray-600">加载中...</span>
              </div>
            </td>
          </tr>

          <!-- 空状态 -->
          <tr v-else-if="links.length === 0">
            <td colspan="5" class="px-6 py-12 text-center">
              <div class="text-gray-400">
                <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <p class="mt-2 text-sm">暂无友情链接</p>
              </div>
            </td>
          </tr>

          <!-- 链接列表 -->
          <tr v-for="link in links" :key="link.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span class="text-sm font-medium text-gray-600">{{ link.name.charAt(0).toUpperCase() }}</span>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ link.name }}</div>
                  <div class="text-sm text-gray-500">{{ link.description || '暂无描述' }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              <a :href="link.url" target="_blank" class="text-orange-600 hover:text-orange-700 truncate max-w-xs block">
                {{ link.url }}
              </a>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ link.sort_order }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                :class="[
                  link.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700',
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
                ]"
              >
                {{ link.enabled ? '启用' : '禁用' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div class="flex items-center space-x-2">
                <button
                  @click="editLink(link)"
                  class="text-orange-600 hover:text-orange-900"
                  title="编辑"
                >
                  <Edit class="h-4 w-4" />
                </button>
                <button
                  @click="confirmDelete(link)"
                  class="text-red-600 hover:text-red-900"
                  title="删除"
                >
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 创建/编辑模态框 -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          {{ editingLink ? '编辑友情链接' : '添加友情链接' }}
        </h3>

        <form @submit.prevent="saveLink" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">网站名称</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="请输入网站名称"
              v-select-all-shortcut
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">链接地址</label>
            <input
              v-model="form.url"
              type="url"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="https://example.com"
              v-select-all-shortcut
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <textarea
              v-model="form.description"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="请输入网站描述（可选）"
              v-select-all-shortcut
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">排序</label>
              <input
                v-model="form.sort_order"
                type="number"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="0"
                v-select-all-shortcut
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <select
                v-model="form.enabled"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option :value="true">启用</option>
                <option :value="false">禁用</option>
              </select>
            </div>
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
            >
              {{ saving ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 删除确认模态框 -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">确认删除</h3>
        <p class="text-sm text-gray-500 mb-6">
          确定要删除友情链接 "{{ linkToDelete?.name }}" 吗？此操作不可恢复。
        </p>
        <div class="flex justify-end space-x-3">
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            取消
          </button>
          <button
            @click="deleteLink"
            :disabled="saving"
            class="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {{ saving ? '删除中...' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Edit, Trash2 } from 'lucide-vue-next'

interface Link {
  id?: string
  name: string
  url: string
  description?: string
  sort_order: number
  enabled: boolean
  created_at?: string
  updated_at?: string
}

const router = useRouter()
const links = ref<Link[]>([])
const loading = ref(false)
const saving = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const editingLink = ref<Link | null>(null)
const linkToDelete = ref<Link | null>(null)

const form = reactive<Link>({
  name: '',
  url: '',
  description: '',
  sort_order: 0,
  enabled: true
})

// 加载友情链接列表
const loadLinks = async (): Promise<void> => {
  loading.value = true
  try {
    const token = localStorage.getItem('admin_token')
    const res = await fetch('/api/admin/links', {
      headers: {
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('admin_token')
        router.push('/admin/login')
        return
      }
      throw new Error(`加载失败 (${res.status})`)
    }

    const data = await res.json()
    links.value = data.items || []
  } catch (err) {
    console.error('加载友情链接失败:', err)
    // 开发环境下使用模拟数据
    if (import.meta.env.DEV) {
      links.value = [
        {
          id: '1',
          name: 'Vue.js',
          url: 'https://vuejs.org/',
          description: '渐进式 JavaScript 框架',
          sort_order: 1,
          enabled: true
        },
        {
          id: '2', 
          name: 'Vite',
          url: 'https://vitejs.dev/',
          description: '下一代前端构建工具',
          sort_order: 2,
          enabled: true
        },
        {
          id: '3',
          name: 'Vitest',
          url: 'https://vitest.dev/',
          description: '由 Vite 提供支持的极速单元测试框架',
          sort_order: 3,
          enabled: true
        }
      ]
    }
  } finally {
    loading.value = false
  }
}

// 编辑链接
const editLink = (link: Link): void => {
  editingLink.value = link
  Object.assign(form, link)
  showEditModal.value = true
}

// 确认删除
const confirmDelete = (link: Link): void => {
  linkToDelete.value = link
  showDeleteModal.value = true
}

// 保存链接
const saveLink = async (): Promise<void> => {
  saving.value = true
  try {
    const token = localStorage.getItem('admin_token')
    const url = editingLink.value?.id 
      ? `/api/admin/links/${editingLink.value.id}`
      : '/api/admin/links'
    
    const method = editingLink.value?.id ? 'PUT' : 'POST'
    
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(form)
    })

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('admin_token')
        router.push('/admin/login')
        return
      }
      throw new Error(`保存失败 (${res.status})`)
    }

    await loadLinks()
    closeModal()
  } catch (err) {
    console.error('保存友情链接失败:', err)
    alert('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

// 删除链接
const deleteLink = async (): Promise<void> => {
  saving.value = true
  try {
    const token = localStorage.getItem('admin_token')
    const res = await fetch(`/api/admin/links/${linkToDelete.value?.id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('admin_token')
        router.push('/admin/login')
        return
      }
      throw new Error(`删除失败 (${res.status})`)
    }

    await loadLinks()
    showDeleteModal.value = false
    linkToDelete.value = null
  } catch (err) {
    console.error('删除友情链接失败:', err)
    alert('删除失败，请重试')
  } finally {
    saving.value = false
  }
}

// 关闭模态框
const closeModal = (): void => {
  showCreateModal.value = false
  showEditModal.value = false
  showEditModal.value = false
  editingLink.value = null
  Object.assign(form, {
    name: '',
    url: '',
    description: '',
    sort_order: 0,
    enabled: true
  })
}

// 初始化加载
onMounted(() => {
  loadLinks()
})
</script>