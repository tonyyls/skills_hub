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

router.post('/feedback', async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getSupabase()
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
    if (!token) {
      res.status(401).json({ message: '未登录或令牌缺失' })
      return
    }
    const { data: userRes, error: userErr } = await (supabase as any).auth.getUser(token)
    if (userErr || !userRes?.user) {
      res.status(401).json({ message: '未登录或令牌无效' })
      return
    }

    const body = req.body as any
    const type = String(body?.type || '').trim()
    const sourceId = String(body?.source_id || '').trim()
    const rawIssues = Array.isArray(body?.issues) ? body.issues : []
    const issues = rawIssues.map((x: any) => String(x || '').trim()).filter(Boolean)
    const comment = String(body?.comment || '').trim()

    if (!type || !sourceId) {
      res.status(400).json({ message: '缺少必填字段：type 或 source_id' })
      return
    }
    if (issues.length === 0 && !comment) {
      res.status(400).json({ message: '缺少有效反馈内容' })
      return
    }
    if (comment.length > 100) {
      res.status(400).json({ message: '其他意见最多100字' })
      return
    }

    const { error } = await supabase
      .from('feedback')
      .insert({ type, source_id: sourceId, user_id: userRes.user.id, issues, comment })
    if (error) throw error
    res.status(201).json({ success: true })
  } catch (e: any) {
    res.status(500).json({ message: e?.message || '提交失败' })
  }
})
