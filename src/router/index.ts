/**
 * 路由配置文件
 * 定义应用的所有路由和页面组件映射
 */
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 页面组件
import HomePage from '@/pages/HomePage.vue'
import SkillsPage from '@/pages/SkillsPage.vue'
import SkillDetailPage from '@/pages/SkillDetailPage.vue'
import ProfilePage from '@/pages/ProfilePage.vue'
import PublishPage from '@/pages/PublishPage.vue'
import AdminLogin from '@/views/AdminLogin.vue'

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
    meta: {
      title: '首页 - Skills Hub'
    }
  },
  {
    path: '/skills',
    name: 'Skills',
    component: SkillsPage,
    meta: {
      title: '技能资源 - Skills Hub'
    }
  },
  {
    path: '/skills/:id',
    name: 'SkillDetail',
    component: SkillDetailPage,
    meta: {
      title: '技能详情 - Skills Hub'
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfilePage,
    meta: {
      title: '个人资料 - Skills Hub',
      requiresAuth: true
    }
  },
  {
    path: '/publish',
    name: 'Publish',
    component: PublishPage,
    meta: {
      title: '发布技能 - Skills Hub',
      requiresAdmin: true
    }
  },
  // 发布页入口已关闭：仅允许管理员后台创建技能
  {
    path: '/about',
    name: 'About',
    component: () => import('@/pages/AboutPage.vue'),
    meta: {
      title: '关于我们 - Skills Hub'
    }
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: () => import('@/pages/AuthCallbackPage.vue'),
    meta: {
      title: '登录回调 - Skills Hub'
    }
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLogin,
    meta: {
      title: '管理员登录 - Skills Hub'
    }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/AdminDashboard.vue'),
    meta: {
      title: '管理后台 - Skills Hub',
      requiresAdmin: true
    },
    children: [
      {
        path: '',
        name: 'AdminOverview',
        component: () => import('@/views/AdminOverview.vue'),
        meta: {
          title: '管理概览 - Skills Hub'
        }
      },
      {
        path: 'categories',
        name: 'AdminCategories',
        component: () => import('@/views/AdminCategories.vue'),
        meta: {
          title: '分类管理 - Skills Hub'
        }
      },
      {
        path: 'skills',
        name: 'AdminSkills',
        component: () => import('@/views/AdminSkills.vue'),
        meta: {
          title: '技能管理 - Skills Hub'
        }
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/AdminUsers.vue'),
        meta: {
          title: '用户管理 - Skills Hub'
        }
      }
      ,
      {
        path: 'profile',
        name: 'AdminProfile',
        component: () => import('@/views/AdminProfile.vue'),
        meta: {
          title: '管理员资料 - Skills Hub'
        }
      },
      {
        path: 'links',
        name: 'AdminLinks',
        component: () => import('@/views/AdminLinks.vue'),
        meta: {
          title: '友情链接管理 - Skills Hub'
        }
      }
    ]
  },
  {
    path: '/tutorial',
    name: 'Tutorial',
    component: () => import('@/pages/TutorialPage.vue'),
    meta: {
      title: '使用教程 - Skills Hub'
    }
  },
  {
    path: '/search',
    name: 'SearchResults',
    component: () => import('@/pages/SearchResultsPage.vue'),
    meta: {
      title: '搜索结果 - Skills Hub'
    }
  },
  {
    path: '/profile/skills',
    name: 'ProfileSkills',
    component: () => import('@/pages/ProfileSkillsPage.vue'),
    meta: {
      title: '我的收藏 - Skills Hub',
      requiresAuth: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/NotFoundPage.vue'),
    meta: {
      title: '页面未找到 - Skills Hub'
    }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 始终滚动到顶部
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

/**
 * 全局路由守卫
 * 处理认证检查和页面标题设置
 */
/**
 * 全局前置守卫：设置标题、处理权限与登录状态恢复。
 *
 * 修复：刷新需要认证的页面（如 `/profile/skills`）时会因 Pinia 状态未恢复而误跳转首页。
 * 方案：在鉴权判断前主动调用 `authStore.initAuth()` 恢复会话，再决定是否重定向。
 */
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 设置页面标题
  document.title = (to.meta.title as string) || 'Skills Hub'

  // 管理员权限校验
  if (to.meta.requiresAdmin) {
    const isAdmin = authStore.checkAdminAuth()
    if (!isAdmin) {
      next('/admin/login')
      return
    }
  }

  // 需要认证的页面：在判断前尝试恢复会话，避免刷新误判
  if (to.meta.requiresAuth) {
    if (!(authStore.user || authStore.adminUser)) {
      // 主动恢复用户/管理员状态（Supabase 会话 + 本地 admin）
      try {
        await authStore.initAuth()
      } catch (e) {
        console.warn('initAuth 失败，继续走未登录逻辑:', e)
      }
    }

    // 恢复后仍未认证则记录重定向并回首页
    if (!(authStore.user || authStore.adminUser)) {
      try {
        localStorage.setItem('redirect_after_login', to.fullPath)
      } catch {}
      next({ path: '/' })
      return
    }
  }

  next()
})

/**
 * 路由错误处理
 */
router.onError((error) => {
  console.error('Router error:', error)
})

export default router