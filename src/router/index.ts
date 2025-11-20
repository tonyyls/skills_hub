/**
 * 路由配置文件
 * 定义应用的所有路由和页面组件映射
 */
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { i18n } from '@/i18n'

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
      titleKey: 'pages.home.title'
    }
  },
  {
    path: '/skills',
    name: 'Skills',
    component: SkillsPage,
    meta: {
      titleKey: 'pages.skills.title'
    }
  },
  {
    path: '/skills/:id',
    name: 'SkillDetail',
    component: SkillDetailPage,
    meta: {
      titleKey: 'pages.skillDetail.title'
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfilePage,
    meta: {
      titleKey: 'nav.profile',
      requiresAuth: true
    }
  },
  {
    path: '/publish',
    name: 'Publish',
    component: PublishPage,
    meta: {
      titleKey: 'nav.skills',
      requiresAdmin: true
    }
  },
  // 发布页入口已关闭：仅允许管理员后台创建技能
  {
    path: '/about',
    name: 'About',
    component: () => import('@/pages/AboutPage.vue'),
    meta: {
      titleKey: 'nav.profile'
    }
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: () => import('@/pages/AuthCallbackPage.vue'),
    meta: {
      titleKey: 'nav.login'
    }
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLogin,
    meta: {
      titleKey: 'pages.login.title'
    }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/AdminDashboard.vue'),
    meta: {
      titleKey: 'nav.profile',
      requiresAdmin: true
    },
    children: [
      {
        path: '',
        name: 'AdminOverview',
        component: () => import('@/views/AdminOverview.vue'),
        meta: {
          titleKey: 'nav.profile'
        }
      },
      {
        path: 'categories',
        name: 'AdminCategories',
        component: () => import('@/views/AdminCategories.vue'),
        meta: {
          titleKey: 'nav.profile'
        }
      },
      {
        path: 'skills',
        name: 'AdminSkills',
        component: () => import('@/views/AdminSkills.vue'),
        meta: {
          titleKey: 'nav.profile'
        }
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/AdminUsers.vue'),
        meta: {
          titleKey: 'nav.profile'
        }
      }
      ,
      {
        path: 'profile',
        name: 'AdminProfile',
        component: () => import('@/views/AdminProfile.vue'),
        meta: {
          titleKey: 'nav.profile'
        }
      },
      {
        path: 'links',
        name: 'AdminLinks',
        component: () => import('@/views/AdminLinks.vue'),
        meta: {
          titleKey: 'nav.profile'
        }
      }
      ,
      {
        path: 'feedback',
        name: 'AdminFeedback',
        component: () => import('@/views/AdminFeedback.vue'),
        meta: {
          titleKey: 'nav.profile'
        }
      }
    ]
  },
  {
    path: '/tutorial',
    name: 'Tutorial',
    component: () => import('@/pages/TutorialPage.vue'),
    meta: {
      titleKey: 'pages.tutorial.title'
    }
  },
  {
    path: '/search',
    name: 'SearchResults',
    component: () => import('@/pages/SearchResultsPage.vue'),
    meta: {
      titleKey: 'common.appTitle'
    }
  },
  {
    path: '/profile/skills',
    name: 'ProfileSkills',
    component: () => import('@/pages/ProfileSkillsPage.vue'),
    meta: {
      titleKey: 'pages.profileSkills.title',
      requiresAuth: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/NotFoundPage.vue'),
    meta: {
      titleKey: 'common.appTitle'
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

  const key = (to.meta.titleKey as string) || 'common.appTitle'
  document.title = i18n.global.t(key)

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