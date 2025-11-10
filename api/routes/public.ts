/**
 * 公共路由：友情链接
 * 提供无需管理员权限的友情链接读取接口。
 */
import { Router, type Request, type Response } from 'express'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const router = Router()

/**
 * 惰性初始化 Supabase 服务端客户端（使用 Service Role Key）
 * 避免 dotenv 未加载时读取到空值。
 */
let supabaseClient: SupabaseClient | null = null
const getSupabase = (): SupabaseClient => {
  if (supabaseClient) return supabaseClient
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('缺少 Supabase 服务端配置环境变量')
  }
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    db: { schema: 'public' }
  })
  return supabaseClient
}

/**
 * 获取启用状态的友情链接列表（公开接口）。
 * - 仅返回 `enabled = true` 的记录
 * - 先按 `sort_order` 升序，再按 `created_at` 降序
 */
router.get('/links', async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('link_exchange')
      .select('*')
      .eq('enabled', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) throw error
    res.status(200).json({ items: data || [] })
  } catch (err: any) {
    // 公开接口在失败时返回空列表，避免泄露错误信息
    res.status(200).json({ items: [] })
  }
})

export default router