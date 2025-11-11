<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900">
          管理员登录
        </h2>
        <p class="mt-2 text-gray-600">
          使用管理员账户登录管理后台
        </p>
      </div>

      <form @submit.prevent="handleLogin" class="mt-8 space-y-6">
        <div class="space-y-4">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700">
              用户名
            </label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              :class="{ 'border-red-500': error }"
              v-select-all-shortcut
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              密码
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              :class="{ 'border-red-500': error }"
              v-select-all-shortcut
            />
          </div>
        </div>

        <div v-if="error" class="text-red-600 text-sm text-center">
          {{ error }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="absolute left-3 inset-y-0 flex items-center">
              <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  username: import.meta.env.DEV ? 'admin' : '',
  password: import.meta.env.DEV ? 'tonyadmin' : ''
})

const loading = ref(false)
const error = ref('')

/**
 * 管理员登录处理
 * 向后端 `POST /api/admin/login` 发送用户名与密码。
 * 成功后保存 `admin_token` 与 `admin_user` 到 localStorage，更新 Pinia 状态并跳转到 `/admin`。
 */
const handleLogin = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form)
    })

    // 兼容后端返回非 JSON 或空响应的情况，避免 response.json() 抛错
    const contentType = response.headers.get('content-type') || ''
    let data: any = null
    if (contentType.includes('application/json')) {
      try {
        data = await response.json()
      } catch {
        data = null
      }
    } else {
      const text = await response.text()
      data = text ? { message: text } : null
    }

    if (!response.ok) {
      const message = (data && data.message) ? data.message : `HTTP ${response.status}`
      throw new Error(message)
    }

    if (!data || !data.token || !data.user) {
      throw new Error('响应数据格式不正确')
    }

    // 保存管理员登录状态
    localStorage.setItem('admin_token', data.token)
    localStorage.setItem('admin_user', JSON.stringify(data.user))
    
    // 更新认证状态
    authStore.setAdminUser(data.user)
    
    // 跳转到管理后台
    router.push('/admin')
  } catch (err: any) {
    error.value = err.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>