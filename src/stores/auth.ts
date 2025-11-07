import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

export interface AdminUser {
  id: string
  username: string
  email: string
  role: 'admin'
  is_active: boolean
  created_at: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const adminUser = ref<AdminUser | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const setUser = (userData: User | null) => {
    user.value = userData
  }

  const setAdminUser = (adminUserData: AdminUser | null) => {
    adminUser.value = adminUserData
  }

  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading
  }

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  const checkAuth = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) throw sessionError
      
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Unknown',
          email: session.user.email || '',
          avatar_url: session.user.user_metadata?.avatar_url || '',
          github_url: session.user.user_metadata?.github_url || '',
          // GitHub 登录默认角色 normal
          role: 'normal',
          created_at: session.user.created_at
        }
        setUser(userData)
      } else {
        setUser(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '认证检查失败')
      console.error('认证检查失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const signInWithGitHub = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (signInError) throw signInError
    } catch (err) {
      setError(err instanceof Error ? err.message : 'GitHub登录失败')
      console.error('GitHub登录失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    setError(null)

    try {
      // 清除管理员登录状态
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      
      // 清除普通用户登录状态
      const { error: signOutError } = await supabase.auth.signOut()
      
      if (signOutError) throw signOutError
      
      setUser(null)
      setAdminUser(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '退出登录失败')
      console.error('退出登录失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const checkAdminAuth = () => {
    const adminToken = localStorage.getItem('admin_token')
    const adminUserData = localStorage.getItem('admin_user')

    if (adminToken && adminUserData) {
      try {
        const userData = JSON.parse(adminUserData)
        // 校验JWT是否过期（前端仅解析exp字段，不做签名校验）
        const payloadPart = adminToken.split('.')[1]
        if (!payloadPart) {
          throw new Error('令牌格式错误')
        }
        const decoded = JSON.parse(atob(payloadPart)) as { exp?: number; role?: string }
        if (decoded?.exp && Date.now() >= decoded.exp * 1000) {
          throw new Error('令牌已过期')
        }
        // 统一角色字段
        userData.role = 'admin'
        setAdminUser(userData)
        return true
      } catch (err) {
        console.error('管理员认证检查失败:', err)
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        return false
      }
    }
    return false
  }

  /**
   * 初始化认证：恢复管理员与普通用户状态，并监听 Supabase 会话变化。
   * - 恢复管理员登录：从 localStorage 读取 `admin_token` 与 `admin_user`。
   * - 恢复普通用户登录：读取 Supabase 会话。
   * - 监听会话变化：登录/登出事件实时更新 Pinia 状态。
   */
  const initAuth = async (): Promise<void> => {
    try {
      // 先恢复管理员状态，避免进入管理页时状态缺失
      checkAdminAuth()

      // 恢复普通用户（Supabase）状态
      await checkAuth()

      // 监听会话变化，确保页面切换或刷新后状态保持
      supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const userData: User = {
            id: session.user.id,
            username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Unknown',
            email: session.user.email || '',
            avatar_url: session.user.user_metadata?.avatar_url || '',
            github_url: session.user.user_metadata?.github_url || '',
            role: 'normal',
            created_at: session.user.created_at
          }
          setUser(userData)
        } else {
          setUser(null)
        }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '认证初始化失败')
      console.error('认证初始化失败:', err)
    }
  }

  return {
    user,
    adminUser,
    loading,
    error,
    setUser,
    setAdminUser,
    setLoading,
    setError,
    checkAuth,
    checkAdminAuth,
    initAuth,
    signInWithGitHub,
    signOut
  }
})