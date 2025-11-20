/**
 * 公共路由：友情链接
 * 提供无需管理员权限的友情链接读取接口。
 */
import { Router, type Request, type Response } from 'express'
import { addFeedback } from '../utils/devStore.js'
import jwt from 'jsonwebtoken'
import { getCached, setCached, etagOf } from '../utils/cache.js'
import { getSupabase } from '../supabase.js'

const router = Router()
const enableFeedback = String(process.env.ENABLE_FEEDBACK ?? process.env.VITE_ENABLE_FEEDBACK ?? 'true') === 'true'

/**
 * 惰性初始化 Supabase 服务端客户端（使用 Service Role Key）
 * 避免 dotenv 未加载时读取到空值。
 */
// Supabase 服务端客户端统一由 api/supabase.ts 提供

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
  if (!enableFeedback) {
    res.status(404).json({ message: '反馈功能已关闭' })
    return
  }
  try {
    const supabase = getSupabase()
    const isDev = process.env.NODE_ENV === 'development'
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
    let userId: string | null = null
    if (token) {
      const { data: userRes, error: userErr } = await (supabase as any).auth.getUser(token)
      if (!userErr && userRes?.user?.id) {
        userId = userRes.user.id
      } else {
        try {
          const secret = process.env.ADMIN_JWT_SECRET
          if (secret) {
            const payload = jwt.verify(token, secret) as jwt.JwtPayload
            const pid = String(payload?.sub || 'admin')
            userId = /^[0-9a-fA-F-]{36}$/.test(pid) ? pid : '00000000-0000-0000-0000-000000000000'
          }
        } catch {}
        if (!userId) {
          res.status(401).json({ message: '未登录或令牌无效' })
          return
        }
      }
    } else if (isDev) {
      userId = (req.headers['x-dev-user-id'] as string) || 'dev-user'
    } else {
      res.status(401).json({ message: '未登录或令牌缺失' })
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

    /**
     * 优先写入数据库，开发环境下若数据库不可用则降级写入本地文件。
     */
    try {
      const { error } = await supabase
        .from('feedback')
        .insert({ type, source_id: sourceId, user_id: userId, issues, comment })
      if (error) throw error
      res.status(201).json({ success: true })
      return
    } catch (err: any) {
      const msg = String(err?.message || '')
      if (
        process.env.NODE_ENV === 'development' &&
        (/schema cache/i.test(msg) || err?.code === 'PGRST002' || /fetch failed/i.test(msg))
      ) {
        try {
          const item = await addFeedback({ type, source_id: sourceId, user_id: userId!, issues, comment })
          res.status(201).json({ success: true, dev: true, item })
          return
        } catch {}
      }
      throw err
    }
  } catch (e: any) {
    res.status(500).json({ message: e?.message || '提交失败' })
  }
})

/**
 * 公开接口：分页获取已发布技能列表
 * GET /api/skills?page=1&limit=24&q=&category=
 * - 仅返回必要字段，去除 content 大字段以提升性能
 * - 统一按创建时间倒序
 * - 返回 { items, page, limit, total }
 */
router.get('/skills', async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getSupabase()
    const page = Math.max(parseInt(String(req.query.page || '1'), 10) || 1, 1)
    const limit = Math.min(Math.max(parseInt(String(req.query.limit || '30'), 10) || 30, 1), 100)
    const q = (req.query.q as string | undefined)?.trim()
    const categoryId = (req.query.category as string | undefined)?.trim()

    let query = supabase
      .from('skills')
      .select('id, name, description, category_id, featured, recommended, author_name, tags, created_at, updated_at', { count: 'exact' })
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (q && q.length > 0) {
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`)
    }
    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1
    const { data, error, count } = await query.range(from, to)
    if (error) throw error

    const items = (data || []).map((row: any) => ({
      id: row.id,
      title: row.name,
      description: row.description || '',
      category_id: row.category_id || '',
      featured: !!row.featured,
      recommended: !!row.recommended,
      author_name: row.author_name || '',
      tags: Array.isArray(row.tags) ? row.tags : [],
      created_at: row.created_at,
      updated_at: row.updated_at
    }))

    res.status(200).json({ items, page, limit, total: count ?? items.length })
  } catch (err: any) {
    res.status(500).json({ message: err?.message || '服务器错误' })
  }
})

/**
 * 公开接口：获取启用分类列表（含缓存与 ETag）
 * GET /api/categories
 */
router.get('/categories', async (req: Request, res: Response): Promise<void> => {
  try {
    const cacheKey = 'categories:active'
    const cached = getCached(cacheKey)
    if (cached) {
      const etag = etagOf(cached)
      if (req.headers['if-none-match'] === etag) {
        res.status(304).end()
        return
      }
      res
        .set('ETag', etag)
        .set('Cache-Control', 's-maxage=600, stale-while-revalidate=86400')
        .status(200).json(cached)
      return
    }

    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, name_en, slug, description, sort_order, is_active, created_at, updated_at')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
    if (error) throw error
    const payload = { items: Array.isArray(data) ? data : [] }
    setCached(cacheKey, payload, 600_000)
    const etag = etagOf(payload)
    res
      .set('ETag', etag)
      .set('Cache-Control', 's-maxage=600, stale-while-revalidate=86400')
      .status(200).json(payload)
  } catch (err: any) {
    res.status(200).json({ items: [] })
  }
})

/**
 * 公开接口：各分类下的已发布技能数量（不受分页影响）
 * GET /api/skills/category-counts
 * 返回 { items: [{ id, name, count }], totalCategories }
 */
router.get('/skills/category-counts', async (req: Request, res: Response): Promise<void> => {
  try {
    const cacheKey = 'category-counts:published'
    const cached = getCached(cacheKey)
    if (cached) {
      const etag = etagOf(cached)
      if (req.headers['if-none-match'] === etag) {
        res.status(304).end()
        return
      }
      res
        .set('ETag', etag)
        .set('Cache-Control', 's-maxage=600, stale-while-revalidate=86400')
        .status(200).json(cached)
      return
    }

    const supabase = getSupabase()
    const { data: cats, error: catErr } = await supabase
      .from('categories')
      .select('id, name')
      .eq('is_active', true)
    if (catErr) throw catErr

    // Try reading materialized view counts
    const { data: mvRows, error: mvErr } = await supabase
      .from('category_skill_counts_mv')
      .select('category_id, count')

    const countMap: Record<string, number> = {}
    if (!mvErr && Array.isArray(mvRows)) {
      for (const r of mvRows) countMap[String((r as any).category_id)] = Number((r as any).count) || 0
    } else {
      // Fallback to direct count if MV not available
      for (const c of (cats || [])) {
        const { count } = await supabase
          .from('skills')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'published')
          .eq('category_id', (c as any).id)
        countMap[String((c as any).id)] = count ?? 0
      }
    }

    const items = (cats || []).map((c: any) => ({
      id: String(c.id),
      name: String(c.name),
      count: countMap[String(c.id)] ?? 0,
    }))
    const payload = { items, totalCategories: items.length }
    setCached(cacheKey, payload, 600_000)
    const etag = etagOf(payload)
    res
      .set('ETag', etag)
      .set('Cache-Control', 's-maxage=600, stale-while-revalidate=86400')
      .status(200).json(payload)
  } catch (err: any) {
    res.status(200).json({ items: [], totalCategories: 0 })
  }
})
// Cache utils moved to shared module
