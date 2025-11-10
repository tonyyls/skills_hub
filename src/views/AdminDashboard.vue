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
              <LayoutDashboard class="mr-3 h-5 w-5" />
              概览
            </router-link>

            <router-link
              to="/admin/categories"
              class="flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors"
              :class="$route.path.startsWith('/admin/categories') ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'"
            >
              <Tags class="mr-3 h-5 w-5" />
              分类管理
            </router-link>

            <router-link
              to="/admin/skills"
              class="flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors"
              :class="$route.path.startsWith('/admin/skills') ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'"
            >
              <Wrench class="mr-3 h-5 w-5" />
              技能管理
            </router-link>

            <router-link
              to="/admin/users"
              class="flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors"
              :class="$route.path.startsWith('/admin/users') ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'"
            >
              <Users class="mr-3 h-5 w-5" />
              用户管理
            </router-link>

            <router-link
              to="/admin/profile"
              class="flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors"
              :class="$route.path.startsWith('/admin/profile') ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'"
            >
              <User class="mr-3 h-5 w-5" />
              个人资料
            </router-link>

            <router-link
              to="/admin/links"
              class="flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors"
              :class="$route.path.startsWith('/admin/links') ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'"
            >
              <Link class="mr-3 h-5 w-5" />
              友情链接
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
import { LayoutDashboard, Tags, Wrench, Users, User, Link } from 'lucide-vue-next'

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