/**
 * 顶部导航栏组件
 * 包含Logo、菜单项、用户登录状态等
 */
<template>
  <nav class="sticky top-0 z-50 bg-white border-b border-[#E5E5E5] relative">
    <!-- 移除蓝紫渐变背景，统一为白橙主题 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex items-center">
          <router-link to="/" class="flex items-center space-x-3 group">
            <img 
               src="/logo.png" 
               alt="Skills Hub Logo" 
               class="w-10 h-10 rounded-xl shadow-lg hover:scale-105 transition-transform duration-200"
             />
            <span class="text-2xl font-bold text-[#333] transition-all duration-300">
              Skills Hub
            </span>
          </router-link>
        </div>

        <!-- 桌面端菜单 -->
        <div class="hidden md:flex items-center space-x-8">
          <router-link 
            to="/" 
            class="nav-link text-[#333] hover:text-[#FF7A45]"
            :class="{ 'active': $route.path === '/' }"
          >
            首页
          </router-link>
          <router-link 
            to="/skills" 
            class="nav-link text-[#333] hover:text-[#FF7A45]"
            :class="{ 'active': $route.path.startsWith('/skills') }"
          >
            技能
          </router-link>
          <router-link 
            to="/tutorials" 
            class="nav-link text-[#333] hover:text-[#FF7A45]"
            :class="{ 'active': $route.path === '/tutorials' }"
          >
            教程
          </router-link>
          <router-link 
            to="/about" 
            class="nav-link text-[#333] hover:text-[#FF7A45]"
            :class="{ 'active': $route.path === '/about' }"
          >
            关于我们
          </router-link>
        </div>

        <!-- 用户操作区域 -->
        <div class="flex items-center space-x-4">
          <!-- 发布技能按钮移除：根据需求暂不展示 -->

          <!-- 用户菜单 -->
          <div v-if="isLoggedIn" class="relative user-menu-container">
            <button
              @click="toggleUserMenu"
              class="flex items-center space-x-2 p-2 rounded-lg hover:bg-[#FFF5EF] transition-colors duration-200"
            >
              <img
                v-if="avatarUrl"
                :src="avatarUrl"
                :alt="displayUsername"
                class="w-8 h-8 rounded-full"
              />
              <div v-else class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User class="w-4 h-4 text-gray-600" />
              </div>
              <span class="text-sm font-medium text-gray-700">
                {{ displayUsername }}
              </span>
              <ChevronDown class="w-4 h-4 text-gray-500" />
            </button>

            <!-- 用户下拉菜单 -->
            <div
              v-if="showUserMenu"
              class="absolute right-0 mt-2 w-48 bg-white shadow-lg border border-gray-200 py-2 z-50"
            >
              <router-link
                to="/profile"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                @click="showUserMenu = false"
              >
                个人资料
              </router-link>
              <router-link
                to="/profile/skills"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                @click="showUserMenu = false"
              >
                我的技能
              </router-link>
              <hr class="my-2 border-gray-200" />
              <router-link
                to="/admin"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                @click="showUserMenu = false"
              >
                管理后台
              </router-link>
              <button
                @click="handleLogout"
                class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                退出登录
              </button>
            </div>
          </div>

          <!-- 语言切换 + 登录文字链接（未登录时显示） -->
          <div v-else class="flex items-center space-x-2">
            <!-- 管理员登录链接 -->
            <router-link
              to="/admin/login"
              class="px-2 py-2 text-[#333] hover:text-[#FF7A45] font-medium"
            >
              管理员登录
            </router-link>
            
            <!-- 语言下拉菜单 -->
            <div class="relative language-menu-container">
              <button
                @click="toggleLanguageMenu"
                class="px-2 py-2 text-[#333] hover:text-[#FF7A45] font-medium flex items-center space-x-1"
                aria-haspopup="true"
                :aria-expanded="showLanguageMenu"
              >
                <span>{{ currentLanguage === 'zh' ? '中文' : 'English' }}</span>
                <ChevronDown class="w-4 h-4 text-gray-500" />
              </button>
              <!-- 下拉内容 -->
              <div
                v-if="showLanguageMenu"
                class="absolute left-0 mt-2 w-28 bg-white shadow-lg border border-gray-200 py-2 z-50"
                role="menu"
              >
                <button
                  class="block w-full text-left px-4 py-2 text-sm text-[#333] hover:bg-[#FFF5EF] hover:text-[#FF7A45] transition-colors duration-200"
                  @click="setLanguage('zh')"
                  role="menuitem"
                >
                  中文
                </button>
                <button
                  class="block w-full text-left px-4 py-2 text-sm text-[#333] hover:bg-[#FFF5EF] hover:text-[#FF7A45] transition-colors duration-200"
                  @click="setLanguage('en')"
                  role="menuitem"
                >
                  English
                </button>
              </div>
            </div>

            <!-- 登录文字链接 -->
            <button
              @click="openLoginModal"
              :disabled="authStore.loading"
              class="px-2 py-2 text-[#333] hover:text-[#FF7A45] font-medium disabled:opacity-50"
            >
              登录
            </button>
          </div>

          <!-- 移动端菜单按钮 -->
          <button
            @click="toggleMobileMenu"
            class="md:hidden p-2 rounded-lg hover:bg-[#FFF5EF] transition-colors duration-200"
          >
            <Menu v-if="!showMobileMenu" class="w-6 h-6 text-gray-600" />
            <X v-else class="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>

      <!-- 移动端菜单 -->
      <div
        v-if="showMobileMenu"
        class="md:hidden border-t border-gray-200 py-4"
      >
        <div class="flex flex-col space-y-2">
          <router-link 
            to="/" 
            class="mobile-nav-link"
            @click="showMobileMenu = false"
          >
            首页
          </router-link>
          <router-link 
            to="/skills" 
            class="mobile-nav-link"
            @click="showMobileMenu = false"
          >
            技能
          </router-link>
          <router-link 
            to="/tutorials" 
            class="mobile-nav-link"
            @click="showMobileMenu = false"
          >
            教程
          </router-link>
          <router-link 
            to="/about" 
            class="mobile-nav-link"
            @click="showMobileMenu = false"
          >
            关于我们
          </router-link>
          
          <div v-if="isLoggedIn" class="pt-2 border-t border-gray-200">
            <router-link
              to="/profile"
              class="mobile-nav-link"
              @click="showMobileMenu = false"
            >
              个人资料
            </router-link>
            <!-- 移除移动端发布技能入口：根据需求暂不展示 -->
            <router-link
              to="/admin"
              class="mobile-nav-link"
              @click="showMobileMenu = false"
            >
              管理后台
            </router-link>
            <button
              @click="handleLogout"
              class="mobile-nav-link text-red-600"
            >
              退出登录
            </button>
          </div>
          
          <!-- 管理员入口 -->
          <div class="pt-2 border-t border-gray-200">
            <router-link
              to="/admin/login"
              class="mobile-nav-link"
              @click="showMobileMenu = false"
            >
              管理员登录
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- 登录弹窗（内嵌实现，移除 Teleport） -->
    <div
      v-if="showLoginModal"
      class="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      @click.self="closeLoginModal"
    >
      <div class="bg-white max-w-md w-full p-6 shadow-2xl border border-[#E5E5E5]">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-[#333]">登录</h3>
          <button class="p-2 hover:bg-[#FFF5EF]" @click="closeLoginModal">
            <X class="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <p class="text-[#666] text-sm mb-4">选择登录方式</p>
        <div class="space-y-3">
          <button
            class="w-full px-4 py-3 bg-gradient-to-r from-[#FF6A3A] to-[#FF7A45] text-white hover:opacity-90 transition-all flex items-center justify-center space-x-2"
            :disabled="authStore.isLoading"
            @click="loginWithGithub"
          >
            <Github class="w-5 h-5" />
            <span>{{ authStore.isLoading ? '登录中...' : 'GitHub 登录' }}</span>
          </button>
          <button
            class="w-full px-4 py-3 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white hover:opacity-90 transition-all flex items-center justify-center space-x-2"
            @click="loginAsAdmin"
          >
            <User class="w-5 h-5" />
            <span>管理员登录</span>
          </button>
          <button
            class="w-full px-4 py-3 bg-[#F7F3EF] text-[#777] hover:bg-[#EFE8E0] transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
            disabled
          >
            <User class="w-5 h-5" />
            <span>微信登录（敬请期待）</span>
          </button>
          <button
            class="w-full px-4 py-3 bg-[#F7F3EF] text-[#777] hover:bg-[#EFE8E0] transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
            disabled
          >
            <User class="w-5 h-5" />
            <span>邮箱登录（敬请期待）</span>
          </button>
        </div>
        <p class="mt-4 text-xs text-gray-500">继续即表示你同意我们的使用条款与隐私政策。</p>
      </div>
    </div>

    <!-- 退出确认弹窗（白橙主题） -->
    <div
      v-if="showLogoutConfirm"
      class="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      @click.self="cancelLogout"
    >
      <div class="bg-white max-w-md w-full p-6 shadow-2xl border border-[#E5E5E5]">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-[#333]">确认退出</h3>
          <button class="p-2 hover:bg-[#FFF5EF]" @click="cancelLogout">
            <X class="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <p class="text-[#666] text-sm mb-4">确定要退出当前账号吗？退出后需要重新登录。</p>
        <div class="flex justify-end space-x-3">
          <button
            class="px-4 py-2 bg-[#F7F3EF] text-[#777] hover:bg-[#EFE8E0] transition rounded"
            @click="cancelLogout"
          >
            取消
          </button>
          <button
            class="px-4 py-2 bg-gradient-to-r from-[#FF6A3A] to-[#FF7A45] text-white hover:opacity-90 transition rounded"
            @click="confirmLogout"
          >
            确认退出
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Code, 
  Plus, 
  User, 
  Github, 
  ChevronDown, 
  Menu, 
  X,
  LogIn
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const showUserMenu = ref(false)
const showLanguageMenu = ref(false)
const currentLanguage = ref<'zh' | 'en'>('zh')
const showMobileMenu = ref(false)
const showLoginModal = ref(false)
const showLogoutConfirm = ref(false)

/**
 * 当前是否已登录（普通用户或管理员）
 */
const isLoggedIn = computed<boolean>(() => !!authStore.user || !!authStore.adminUser)

/**
 * 当前展示的用户名（优先管理员）
 */
const displayUsername = computed<string>(() => authStore.adminUser?.username || authStore.user?.username || '未登录')

/**
 * 当前展示的头像URL（普通用户有头像，管理员无头像则回退空字符串）
 */
const avatarUrl = computed<string>(() => authStore.user?.avatar_url || '')

/**
 * 切换用户菜单展开状态
 */
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

/**
 * 切换语言下拉菜单展开状态
 */
const toggleLanguageMenu = () => {
  showLanguageMenu.value = !showLanguageMenu.value
}

/**
 * 设置语言（中文/英文），并持久化到 localStorage 与 html lang
 * @param lang - 'zh' 或 'en'
 */
const setLanguage = (lang: 'zh' | 'en') => {
  currentLanguage.value = lang
  try {
    localStorage.setItem('appLanguage', lang)
  } catch {}
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
  showLanguageMenu.value = false
}

/**
 * 打开登录弹窗
 */
const openLoginModal = () => {
  showLoginModal.value = true
}

/**
 * 关闭登录弹窗
 */
const closeLoginModal = () => {
  showLoginModal.value = false
}

/**
 * 管理员登录
 */
const loginAsAdmin = () => {
  closeLoginModal()
  router.push('/admin/login')
}

/**
 * 使用 GitHub 登录
 * 成功后关闭弹窗
 */
/**
 * 使用 GitHub 登录成功后关闭弹窗
 */
const loginWithGithub = async () => {
  await authStore.signInWithGitHub()
  showLoginModal.value = false
}

// 原 handleLogin 保留但不再使用
/**
 * 处理GitHub登录（旧）
 * @deprecated 请使用 loginWithGithub
 */
const handleLogin = async () => {
  await authStore.signInWithGitHub()
}

/**
 * 显示退出确认弹窗
 * 用户点击退出按钮后先展示确认弹窗
 */
const handleLogout = () => {
  showLogoutConfirm.value = true
}

/**
 * 取消退出，关闭确认弹窗
 */
const cancelLogout = () => {
  showLogoutConfirm.value = false
}

/**
 * 确认退出并清理状态
 * 执行实际的登出操作，关闭菜单并跳转首页
 */
const confirmLogout = async () => {
  await authStore.signOut()
  showUserMenu.value = false
  showMobileMenu.value = false
  showLogoutConfirm.value = false
  router.push('/')
}

/**
 * 点击外部关闭用户与语言菜单
 * 同时保证各自容器内点击不关闭对应菜单
 */
const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (!target.closest('.user-menu-container')) {
    showUserMenu.value = false
  }
  if (!target.closest('.language-menu-container')) {
    showLanguageMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  authStore.checkAuth()
  // 初始化语言：读取本地存储，设置 html lang
  try {
    const saved = localStorage.getItem('appLanguage') as 'zh' | 'en' | null
    if (saved === 'zh' || saved === 'en') {
      currentLanguage.value = saved
    }
  } catch {}
  document.documentElement.lang = currentLanguage.value === 'zh' ? 'zh-CN' : 'en'
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.nav-link {
  @apply px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative text-[#333] hover:text-[#FF7A45];
}

.nav-link::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #FF6A3A, #FF7A45);
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.nav-link:hover::before {
  width: 80%;
}

.nav-link.active {
  @apply text-[#FF7A45];
}

.nav-link.active::before {
  width: 80%;
}

.mobile-nav-link {
  @apply block px-4 py-3 text-base font-medium text-[#333] hover:text-[#FF7A45] hover:bg-[#FFF5EF] rounded-lg transition-all duration-200;
}

.user-menu-container {
  position: relative;
}

/* 移动端菜单背景统一为白色 + 浅灰边框 */
.md\:hidden > div {
  background: #ffffff;
  border: 1px solid #E5E5E5;
  border-radius: 16px;
  margin-top: 1rem;
}

/* 登录弹窗动画（借助玻璃态与阴影） */
.glass {
  /* 若全局已有 glass，这里兼容覆盖小范围效果 */
}
</style>