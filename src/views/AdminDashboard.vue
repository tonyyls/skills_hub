<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航栏 -->
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">管理后台</h1>
          </div>
          
        </div>
      </div>
    </nav>

    <div class="flex">
      <!-- 侧边栏 -->
      <div class="w-64 bg-white shadow-sm min-h-screen">
        <nav class="mt-8">
          <div class="px-4 space-y-2">
            <router-link
              to="/admin"
              class="flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors"
              :class="$route.path === '/admin' ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'"
            >
              <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V9h6v8" />
              </svg>
              概览
            </router-link>

            <router-link
              to="/admin/categories"
              class="flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors"
              :class="$route.path.startsWith('/admin/categories') ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'"
            >
              <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              分类管理
            </router-link>

            <router-link
              to="/admin/skills"
              class="flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors"
              :class="$route.path.startsWith('/admin/skills') ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'"
            >
              <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              技能管理
            </router-link>

            <router-link
              to="/admin/users"
              class="flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors"
              :class="$route.path.startsWith('/admin/users') ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'"
            >
              <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              用户管理
            </router-link>

            <router-link
              to="/admin/profile"
              class="flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors"
              :class="$route.path.startsWith('/admin/profile') ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'"
            >
              <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A7 7 0 0112 15a7 7 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0" />
              </svg>
              个人资料
            </router-link>
          </div>
        </nav>
      </div>

      <!-- 主内容区域 -->
      <div class="flex-1 p-8">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 检查管理员认证
onMounted(() => {
  const isAdmin = authStore.checkAdminAuth()
  if (!isAdmin) {
    router.push('/admin/login')
  }
})

const handleLogout = () => {
  authStore.signOut()
  router.push('/')
}
</script>