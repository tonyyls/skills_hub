/**
 * 路由配置文件
 * 定义应用的所有路由和页面组件映射
 */
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 页面组件
import HomePage from '@/pages/HomePage.vue'
import SkillsPage from '@/pages/SkillsPage.vue'
import SkillDetailPage from '@/pages/SkillDetailPage.vue'
import ProfilePage from '@/pages/ProfilePage.vue'
import PublishPage from '@/pages/PublishPage.vue'
import ExplorePage from '@/pages/ExplorePage.vue'
import AdminLogin from '@/views/AdminLogin.vue'

// 路由配置
const routes = [
  {
    path: '/',
    name: 'Home',
    component: ExplorePage,
    meta: {
      title: '探索技能 - Skills Hub'
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
      requiresAuth: true
    }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/pages/AboutPage.vue'),
    meta: {
      title: '关于我们 - Skills Hub'
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
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 设置页面标题
  document.title = to.meta.title as string || 'Skills Hub'
  
  // 检查是否需要管理员权限
  if (to.meta.requiresAdmin) {
    const isAdmin = authStore.checkAdminAuth()
    if (!isAdmin) {
      next('/admin/login')
      return
    }
  }
  
  // 检查是否需要认证
  if (to.meta.requiresAuth && !authStore.user) {
    // 保存目标路由，登录后跳转回来
    next({
      path: '/',
      query: { redirect: to.fullPath }
    })
  } else {
    next()
  }
})

/**
 * 路由错误处理
 */
router.onError((error) => {
  console.error('Router error:', error)
})

export default router