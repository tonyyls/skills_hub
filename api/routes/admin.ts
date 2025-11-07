/**
 * 管理员登录路由
 * 提供基于用户名/密码的管理员登录（仅用于开发/演示）。
 * 警告：生产环境请使用安全的身份验证与加密存储，避免硬编码凭据。
 */
import { Router, type Request, type Response } from 'express'
import jwt from 'jsonwebtoken'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import {
  readCategories,
  addCategory,
  updateCategory as devUpdateCategory,
  deleteCategory as devDeleteCategory,
  readSkills,
  addSkill as devAddSkill,
  updateSkill as devUpdateSkill,
  deleteSkill as devDeleteSkill,
  readUsers,
  addUser as devAddUser,
  updateUser as devUpdateUser,
  deleteUser as devDeleteUser
} from '../utils/devStore.js'

const router = Router()

/**
 * Supabase 服务端客户端惰性初始化（使用 Service Role Key）
 * 避免在 dotenv 加载之前就读取环境变量导致未配置。
 */
let supabaseClient: SupabaseClient | null = null
const getSupabase = (): SupabaseClient => {
  if (supabaseClient) return supabaseClient
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('缺少 Supabase 服务端配置环境变量')
  }
  // 显式指定使用 public schema，避免 PostgREST schema 解析异常
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    db: { schema: 'public' }
  })
  return supabaseClient
}

/**
 * 验证管理员JWT的中间件
 * 读取 `Authorization: Bearer <token>` 并校验签名与有效期。
 */
const verifyAdminToken = (req: Request, res: Response, next: Function) => {
  try {
    const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET
    if (!ADMIN_JWT_SECRET) {
      res.status(500).json({ message: '服务器配置错误：缺少 ADMIN_JWT_SECRET' })
      return
    }

    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: '未提供认证信息' })
      return
    }
    const token = authHeader.slice(7)
    const payload = jwt.verify(token, ADMIN_JWT_SECRET) as jwt.JwtPayload
    if (payload.role !== 'admin') {
      res.status(403).json({ message: '权限不足' })
      return
    }
    // 将payload附加到请求对象供后续路由使用
    ;(req as any).admin = payload
    next()
  } catch (err) {
    res.status(401).json({ message: '令牌无效或已过期' })
  }
}

/**
 * 管理员登录
 * POST /api/admin/login
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body as { username?: string; password?: string }

    // 读取环境变量，若未设置则使用开发默认值
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'tonyadmin'
    const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET

    if (!username || !password) {
      res.status(400).json({ message: '缺少用户名或密码' })
      return
    }

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      res.status(401).json({ message: '用户名或密码错误' })
      return
    }

    // 检查JWT密钥
    if (!ADMIN_JWT_SECRET) {
      res.status(500).json({ message: '服务器配置错误：缺少 ADMIN_JWT_SECRET' })
      return
    }

    /**
     * 生成管理员JWT
     * 使用对称密钥签名，设置24小时过期与issuer标识。
     */
    const token = jwt.sign(
      {
        sub: 'admin',
        username: ADMIN_USERNAME,
        role: 'admin'
      },
      ADMIN_JWT_SECRET,
      {
        expiresIn: '24h',
        issuer: 'skills-hub'
      }
    )

    // 统一用户结构，内置管理员角色为 admin
    const user = {
      id: 'admin',
      username: ADMIN_USERNAME,
      email: '',
      role: 'admin' as const,
      is_active: true,
      created_at: new Date().toISOString()
    }

    res.status(200).json({ token, user })
  } catch (error) {
    res.status(500).json({ message: '服务器错误' })
  }
})

/**
 * 受保护示例：获取管理员信息
 * GET /api/admin/me
 */
router.get('/me', verifyAdminToken, async (req: Request, res: Response): Promise<void> => {
  const payload = (req as any).admin as jwt.JwtPayload
  res.status(200).json({
    id: 'admin',
    username: payload?.username || 'admin',
    role: 'admin',
    is_active: true,
    created_at: new Date().toISOString()
  })
})

/**
 * 获取所有分类（支持搜索）
 * GET /api/admin/categories?q=关键词
 */
router.get('/categories', verifyAdminToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getSupabase()
    const q = (req.query.q as string | undefined)?.trim()

    // 使用实际存在的表名 `categories`，避免查询不存在的表
    let query = supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    // 为兼容最小字段集，仅在 name/description 上搜索，避免不存在列导致错误
    if (q && q.length > 0) {
      query = query.or(
        `name.ilike.%${q}%,name_en.ilike.%${q}%,description.ilike.%${q}%,description_en.ilike.%${q}%,slug.ilike.%${q}%`
      )
    }

    const { data, error } = await query
    if (error) {
      // 针对 Supabase PostgREST "schema cache" 或网络 "fetch failed" 做降级处理，避免前端页面报错
      if (/schema cache/i.test(error.message) || error.code === 'PGRST002' || /fetch failed/i.test(error.message)) {
        console.warn('[admin routes] 分类查询降级为本地开发存储：', error.message)
        const items = await readCategories()
        // 搜索兼容
        const filtered = q
          ? items.filter(i => [i.name, i.name_en, i.description, i.description_en, i.slug]
              .filter(Boolean)
              .some(v => String(v).toLowerCase().includes(q.toLowerCase())))
          : items
        // 排序兼容
        filtered.sort((a, b) => a.sort_order - b.sort_order || (b.created_at.localeCompare(a.created_at)))
        res.status(200).json({ items: filtered })
        return
      }
      res.status(500).json({ message: '查询分类失败', error: error.message })
      return
    }
    res.status(200).json({ items: data || [] })
  } catch (err) {
    const msg = err instanceof Error ? err.message : '服务器错误'
    res.status(500).json({ message: msg })
  }
})

/**
 * 搜索分类（别名接口）
 * GET /api/admin/categories/search?q=关键词
 */
router.get('/categories/search', verifyAdminToken, async (req: Request, res: Response): Promise<void> => {
  // 复用 /categories 的实现
  return router.handle({ ...req, url: '/categories' } as any, res as any, () => {})
})

/**
 * 创建分类
 * POST /api/admin/categories
 */
router.post('/categories', verifyAdminToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getSupabase()
    const { name, name_en, description, description_en, slug, is_active, sort_order } = req.body as {
      name?: string
      name_en?: string
      description?: string
      description_en?: string
      slug?: string
      is_active?: boolean
      sort_order?: number
    }

    if (!name || !slug) {
      res.status(400).json({ message: '缺少必填字段：name 或 slug' })
      return
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name,
        name_en: name_en || null,
        description: description || null,
        description_en: description_en || null,
        slug,
        is_active: typeof is_active === 'boolean' ? is_active : true,
        sort_order: typeof sort_order === 'number' ? sort_order : 0
      })
      .select()

    if (error) {
      if (/schema cache/i.test(error.message) || error.code === 'PGRST002' || /fetch failed/i.test(error.message)) {
        try {
          const item = await addCategory({ name, name_en, description, description_en, slug, is_active, sort_order })
          res.status(201).json({ item })
          return
        } catch (e: any) {
          const msg = e?.message || '创建分类失败'
          const code = msg.includes('slug 已存在') ? 409 : 500
          res.status(code).json({ message: msg })
          return
        }
      }
      res.status(500).json({ message: '创建分类失败', error: error.message })
      return
    }
    res.status(201).json({ item: data?.[0] })
  } catch (err) {
    const msg = err instanceof Error ? err.message : '服务器错误'
    res.status(500).json({ message: msg })
  }
})

/**
 * 更新分类
 * PUT /api/admin/categories/:id
 */
router.put('/categories/:id', verifyAdminToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getSupabase()
    const { id } = req.params
    const { name, name_en, description, description_en, slug, is_active, sort_order } = req.body as {
      name?: string
      name_en?: string
      description?: string
      description_en?: string
      slug?: string
      is_active?: boolean
      sort_order?: number
    }

    const updateData: Record<string, any> = {}
    if (name !== undefined) updateData.name = name
    if (name_en !== undefined) updateData.name_en = name_en
    if (description !== undefined) updateData.description = description
    if (description_en !== undefined) updateData.description_en = description_en
    if (slug !== undefined) updateData.slug = slug
    if (is_active !== undefined) updateData.is_active = is_active
    if (sort_order !== undefined) updateData.sort_order = sort_order
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      if (/schema cache/i.test(error.message) || error.code === 'PGRST002' || /fetch failed/i.test(error.message)) {
        try {
          const item = await devUpdateCategory(id, updateData)
          if (!item) {
            res.status(404).json({ message: '分类不存在' })
            return
          }
          res.status(200).json({ item })
          return
        } catch (e: any) {
          const msg = e?.message || '更新分类失败'
          const code = msg.includes('slug 已存在') ? 409 : 500
          res.status(code).json({ message: msg })
          return
        }
      }
      res.status(500).json({ message: '更新分类失败', error: error.message })
      return
    }
    if (!data || data.length === 0) {
      res.status(404).json({ message: '分类不存在' })
      return
    }
    res.status(200).json({ item: data[0] })
  } catch (err) {
    const msg = err instanceof Error ? err.message : '服务器错误'
    res.status(500).json({ message: msg })
  }
})

/**
 * 删除分类
 * DELETE /api/admin/categories/:id
 */
router.delete('/categories/:id', verifyAdminToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getSupabase()
    const { id } = req.params
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) {
      if (/schema cache/i.test(error.message) || error.code === 'PGRST002' || /fetch failed/i.test(error.message)) {
        const ok = await devDeleteCategory(id)
        if (!ok) {
          res.status(404).json({ message: '分类不存在' })
          return
        }
        // 返回 200 并携带 JSON，避免前端在某些环境中将 204 视为已中止（ERR_ABORTED）
        res.status(200).json({ success: true })
        return
      }
      res.status(500).json({ message: '删除分类失败', error: error.message })
      return
    }
    // 返回 200 并携带 JSON，避免前端在某些环境中将 204 视为已中止（ERR_ABORTED）
    res.status(200).json({ success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : '服务器错误'
    res.status(500).json({ message: msg })
  }
})

/**
 * 获取技能列表（支持分页、筛选、搜索）
 * GET /api/admin/skills?page=1&limit=20&status=&category=&q=
 */
router.get('/skills', verifyAdminToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getSupabase()
    const page = Math.max(parseInt(String(req.query.page || '1'), 10) || 1, 1)
    const limit = Math.min(Math.max(parseInt(String(req.query.limit || '20'), 10) || 20, 1), 100)
    const status = (req.query.status as string | undefined)?.trim()
    const categoryId = (req.query.category as string | undefined)?.trim()
    const q = (req.query.q as string | undefined)?.trim()

    try {
      let query = supabase
        .from('skills')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (status) query = query.eq('status', status)
      if (categoryId) query = query.eq('category_id', categoryId)
      if (q && q.length > 0) {
        // 最小搜索集：title/description/content
        query = query.or(
          `title.ilike.%${q}%,title_en.ilike.%${q}%,description.ilike.%${q}%,description_en.ilike.%${q}%,content.ilike.%${q}%`
        )
      }

      const from = (page - 1) * limit
      const to = from + limit - 1
      const { data, error, count } = await query.range(from, to)
      if (error) throw error
      res.status(200).json({ items: data || [], page, pageSize: limit, total: count ?? (data?.length || 0) })
      return
    } catch (error: any) {
      // 降级为开发本地存储
      if (/schema cache/i.test(error?.message) || error?.code === 'PGRST002' || /fetch failed/i.test(error?.message)) {
        console.warn('[admin routes] 技能查询降级为本地开发存储：', error?.message)
        const items = await readSkills()
        const filtered = items.filter(s => {
          const statusOk = !status || s.status === status
          const categoryOk = !categoryId || s.category_id === categoryId
          const qOk = !q || [s.title, s.title_en, s.description, s.description_en, s.content, s.content_en]
            .filter(Boolean)
            .some(v => String(v).toLowerCase().includes(q.toLowerCase()))
          return statusOk && categoryOk && qOk
        })
        filtered.sort((a, b) => (b.created_at.localeCompare(a.created_at)))
        const total = filtered.length
        const start = (page - 1) * limit
        const end = start + limit
        const pageItems = filtered.slice(start, end)
        res.status(200).json({ items: pageItems, page, pageSize: limit, total })
        return
      }
      throw error
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : '服务器错误'
    res.status(500).json({ message: msg })
  }
})

/**
 * 创建技能
 * POST /api/admin/skills
 */
router.post('/skills', verifyAdminToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getSupabase()
    const body = req.body as any
    const required = ['title', 'content', 'category_id']
    for (const k of required) {
      if (!body?.[k]) {
        res.status(400).json({ message: `缺少必填字段：${k}` })
        return
      }
    }
    const payload: Record<string, any> = {
      title: body.title,
      title_en: body.title_en ?? null,
      description: body.description ?? null,
      description_en: body.description_en ?? null,
      content: body.content,
      content_en: body.content_en ?? null,
      category_id: body.category_id,
      difficulty_level: body.difficulty_level ?? 'beginner',
      estimated_time: body.estimated_time ?? null,
      tags: Array.isArray(body.tags) ? body.tags : (typeof body.tags === 'string' ? body.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []),
      prerequisites: Array.isArray(body.prerequisites) ? body.prerequisites : [],
      status: body.status ?? 'draft',
      featured: !!body.featured
    }
    const { data, error } = await supabase.from('skills').insert(payload).select()
    if (error) {
      if (/schema cache/i.test(error.message) || error.code === 'PGRST002' || /fetch failed/i.test(error.message)) {
        const item = await devAddSkill({ ...payload })
        res.status(201).json({ item })
        return
      }
      res.status(500).json({ message: '创建技能失败', error: error.message })
      return
    }
    res.status(201).json({ item: data?.[0] })
  } catch (err) {
    const msg = err instanceof Error ? err.message : '服务器错误'
    res.status(500).json({ message: msg })
  }
})

/**
 * 更新技能
 * PUT /api/admin/skills/:id
 */
router.put('/skills/:id', verifyAdminToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getSupabase()
    const { id } = req.params
    const body = req.body as any
    const patch: Record<string, any> = { updated_at: new Date().toISOString() }
    const fields = ['title','title_en','description','description_en','content','content_en','category_id','difficulty_level','estimated_time','tags','prerequisites','status','featured']
    for (const k of fields) {
      if (body[k] !== undefined) patch[k] = body[k]
    }
    const { data, error } = await supabase.from('skills').update(patch).eq('id', id).select()
    if (error) {
      if (/schema cache/i.test(error.message) || error.code === 'PGRST002' || /fetch failed/i.test(error.message)) {
        const item = await devUpdateSkill(id, patch)
        if (!item) {
          res.status(404).json({ message: '技能不存在' })
          return
        }
        res.status(200).json({ item })
        return
      }
      res.status(500).json({ message: '更新技能失败', error: error.message })
      return
    }
    if (!data || data.length === 0) {
      res.status(404).json({ message: '技能不存在' })
      return
    }
    res.status(200).json({ item: data[0] })
  } catch (err) {
    const msg = err instanceof Error ? err.message : '服务器错误'
    res.status(500).json({ message: msg })
  }
})

/**
 * 删除技能
 * DELETE /api/admin/skills/:id
 */
router.delete('/skills/:id', verifyAdminToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getSupabase()
    const { id } = req.params
    const { error } = await supabase.from('skills').delete().eq('id', id)
    if (error) {
      if (/schema cache/i.test(error.message) || error.code === 'PGRST002' || /fetch failed/i.test(error.message)) {
        const ok = await devDeleteSkill(id)
        if (!ok) {
          res.status(404).json({ message: '技能不存在' })
          return
        }
        res.status(200).json({ success: true })
        return
      }
      res.status(500).json({ message: '删除技能失败', error: error.message })
      return
    }
    res.status(200).json({ success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : '服务器错误'
    res.status(500).json({ message: msg })
  }
})

/**
 * 获取技能列表（支持搜索、分页、筛选）
 * GET /api/admin/skills?q=关键词&page=1&limit=20&status=published&category=1&difficulty=beginner
 */
router.get('/skills', verifyAdminToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getSupabase()
    const q = (req.query.q as string | undefined)?.trim()
    const page = parseInt(req.query.page as string) || 1
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100) // 最大100条
    const offset = (page - 1) * limit
    const status = req.query.status as string | undefined
    const category = req.query.category as string | undefined
    const difficulty = req.query.difficulty as string | undefined

    // 基础查询
    let query = supabase
      .from('skills')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    // 搜索条件
    if (q && q.length > 0) {
      query = query.or(
        `title.ilike.%${q}%,title_en.ilike.%${q}%,description.ilike.%${q}%,description_en.ilike.%${q}%,content.ilike.%${q}%,content_en.ilike.%${q}%`
      )
    }

    // 筛选条件
    if (status) {
      query = query.eq('status', status)
    }
    if (category) {
      query = query.eq('category_id', category)
    }
    if (difficulty) {
      query = query.eq('difficulty_level', difficulty)
    }

    // 分页
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      if (/schema cache/i.test(error.message) || error.code === 'PGRST002' || /fetch failed/i.test(error.message)) {
        console.warn('[admin routes] 技能查询降级为本地开发存储：', error.message)
        // TODO: 实现本地开发存储的技能数据
        res.status(200).json({ 
          items: [], 
          total: 0, 
          page, 
          limit, 
          totalPages: 0 
        })
        return
      }
      res.status(500).json({ message: '查询技能失败', error: error.message })
      return
    }

    res.status(200).json({ 
      items: data || [], 
      total: count || 0, 
      page, 
      limit, 
      totalPages: Math.ceil((count || 0) / limit)
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : '服务器错误'
    res.status(500).json({ message: msg })
  }
})

/**
 * 获取技能详情
 * GET /api/admin/skills/:id
 */
router.get('/skills/:id', verifyAdminToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getSupabase()
    const { id } = req.params

    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // 未找到记录
        res.status(404).json({ message: '技能不存在' })
        return
      }
      res.status(500).json({ message: '查询技能失败', error: error.message })
      return
    }

    if (!data) {
      res.status(404).json({ message: '技能不存在' })
      return
    }

    res.status(200).json({ item: data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : '服务器错误'
    res.status(500).json({ message: msg })
  }
})

/**
 * 创建技能
 * POST /api/admin/skills
 */
router.post('/skills', verifyAdminToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getSupabase()
    const { 
      title, 
      title_en, 
      description, 
      description_en, 
      content, 
      content_en, 
      category_id, 
      difficulty_level, 
      estimated_time, 
      tags, 
      status, 
      featured 
    } = req.body as {
      title: string
      title_en?: string
      description?: string
      description_en?: string
      content: string
      content_en?: string
      category_id: string
      difficulty_level: 'beginner' | 'intermediate' | 'advanced'
      estimated_time?: number
      tags?: string[]
      status?: 'draft' | 'published' | 'archived'
      featured?: boolean
    }

    if (!title || !content || !category_id) {
      res.status(400).json({ message: '缺少必填字段：title、content 或 category_id' })
      return
    }

    const insertData = {
      title,
      title_en: title_en || null,
      description: description || null,
      description_en: description_en || null,
      content,
      content_en: content_en || null,
      category_id,
      difficulty_level,
      estimated_time: estimated_time || null,
      tags: tags || [],
      status: status || 'draft',
      featured: typeof featured === 'boolean' ? featured : false,
      published_at: status === 'published' ? new Date().toISOString() : null
    }

    const { data, error } = await supabase
      .from('skills')
      .insert(insertData)
      .select()

    if (error) {
      res.status(500).json({ message: '创建技能失败', error: error.message })
      return
    }

    res.status(201).json({ item: data?.[0] })
  } catch (err) {
    const msg = err instanceof Error ? err.message : '服务器错误'
    res.status(500).json({ message: msg })
  }
})

/**
 * 更新技能
 * PUT /api/admin/skills/:id
 */
router.put('/skills/:id', verifyAdminToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getSupabase()
    const { id } = req.params
    const { 
      title, 
      title_en, 
      description, 
      description_en, 
      content, 
      content_en, 
      category_id, 
      difficulty_level, 
      estimated_time, 
      tags, 
      status, 
      featured 
    } = req.body as {
      title?: string
      title_en?: string
      description?: string
      description_en?: string
      content?: string
      content_en?: string
      category_id?: string
      difficulty_level?: 'beginner' | 'intermediate' | 'advanced'
      estimated_time?: number
      tags?: string[]
      status?: 'draft' | 'published' | 'archived'
      featured?: boolean
    }

    const updateData: Record<string, any> = {}
    if (title !== undefined) updateData.title = title
    if (title_en !== undefined) updateData.title_en = title_en
    if (description !== undefined) updateData.description = description
    if (description_en !== undefined) updateData.description_en = description_en
    if (content !== undefined) updateData.content = content
    if (content_en !== undefined) updateData.content_en = content_en
    if (category_id !== undefined) updateData.category_id = category_id
    if (difficulty_level !== undefined) updateData.difficulty_level = difficulty_level
    if (estimated_time !== undefined) updateData.estimated_time = estimated_time
    if (tags !== undefined) updateData.tags = tags
    if (status !== undefined) {
      updateData.status = status
      if (status === 'published') {
        updateData.published_at = new Date().toISOString()
      }
    }
    if (featured !== undefined) updateData.featured = featured
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('skills')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      res.status(500).json({ message: '更新技能失败', error: error.message })
      return
    }

    if (!data || data.length === 0) {
      res.status(404).json({ message: '技能不存在' })
      return
    }

    res.status(200).json({ item: data[0] })
  } catch (err) {
    const msg = err instanceof Error ? err.message : '服务器错误'
    res.status(500).json({ message: msg })
  }
})

/**
 * 删除技能
 * DELETE /api/admin/skills/:id
 */
router.delete('/skills/:id', verifyAdminToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getSupabase()
    const { id } = req.params

    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('id', id)

    if (error) {
      res.status(500).json({ message: '删除技能失败', error: error.message })
      return
    }

    // 返回 200 并携带 JSON，避免前端在某些环境中将 204 视为已中止（ERR_ABORTED）
    res.status(200).json({ success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : '服务器错误'
    res.status(500).json({ message: msg })
  }
})

/**
 * 获取所有用户（支持搜索）
 * GET /api/admin/users?q=关键词
 */
router.get('/users', verifyAdminToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getSupabase()
    const q = (req.query.q as string | undefined)?.trim()

    let query = supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false })

    // 搜索用户名和邮箱
    if (q && q.length > 0) {
      query = query.or(`username.ilike.%${q}%,email.ilike.%${q}%`)
    }

    const { data, error } = await query
    if (error) {
      // 针对 Supabase/PostgREST 网络与 schema 问题降级为本地开发存储
      if (/schema cache/i.test(error.message) || error.code === 'PGRST002' || /fetch failed/i.test(error.message)) {
        console.warn('[admin routes] 用户查询降级为本地开发存储：', error.message)
        const items = await readUsers()
        const filtered = q
          ? items.filter(u => [u.username, u.email]
              .filter(Boolean)
              .some(v => String(v).toLowerCase().includes(q!.toLowerCase())))
          : items
        // 兼容排序（按 created_at 倒序）
        filtered.sort((a, b) => (b.created_at.localeCompare(a.created_at)))
        res.status(200).json({ items: filtered })
        return
      }
      res.status(500).json({ message: '查询用户失败', error: error.message })
      return
    }
    res.status(200).json({ items: data || [] })
  } catch (err) {
    // 当 Supabase 客户端初始化失败（环境变量缺失）时，降级为本地开发存储
    const msg = err instanceof Error ? err.message : '服务器错误'
    if (err instanceof Error && (/缺少 Supabase/i.test(err.message) || /Supabase/i.test(err.message))) {
      console.warn('[admin routes] 用户查询降级为本地开发存储（客户端初始化失败）：', err.message)
      const q = (req.query.q as string | undefined)?.trim()
      const items = await readUsers()
      const filtered = q
        ? items.filter(u => [u.username, u.email]
            .filter(Boolean)
            .some(v => String(v).toLowerCase().includes(q!.toLowerCase())))
        : items
      filtered.sort((a, b) => (b.created_at.localeCompare(a.created_at)))
      res.status(200).json({ items: filtered })
      return
    }
    res.status(500).json({ message: msg })
  }
})

/**
 * 创建用户
 * POST /api/admin/users
 */
router.post('/users', verifyAdminToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getSupabase()
    const { 
      username, 
      email, 
      password, 
      role, 
      is_active 
    } = req.body as {
      username: string
      email: string
      password: string
      role: 'admin' | 'super_admin'
      is_active?: boolean
    }

    if (!username || !email || !password) {
      res.status(400).json({ message: '缺少必填字段：username、email 或 password' })
      return
    }

    const insertData = {
      username,
      email,
      password, // 注意：生产环境应该加密密码
      role: role || 'admin',
      is_active: typeof is_active === 'boolean' ? is_active : true,
      last_login_at: null
    }

    const { data, error } = await supabase
      .from('admin_users')
      .insert(insertData)
      .select()

    if (error) {
      if (/schema cache/i.test(error.message) || error.code === 'PGRST002' || /fetch failed/i.test(error.message)) {
        console.warn('[admin routes] 用户创建降级为本地开发存储：', error.message)
        const item = await devAddUser({
          username,
          email,
          password,
          role: role || 'admin',
          is_active: typeof is_active === 'boolean' ? is_active : true,
          last_login_at: null
        })
        res.status(201).json({ item })
        return
      }
      res.status(500).json({ message: '创建用户失败', error: error.message })
      return
    }

    res.status(201).json({ item: data?.[0] })
  } catch (err) {
    // 当 Supabase 客户端初始化失败（环境变量缺失）时，降级为本地开发存储
    const msg = err instanceof Error ? err.message : '服务器错误'
    if (err instanceof Error && (/缺少 Supabase/i.test(err.message) || /Supabase/i.test(err.message))) {
      console.warn('[admin routes] 用户创建降级为本地开发存储（客户端初始化失败）：', err.message)
      const { username, email, password, role, is_active } = req.body as {
        username: string
        email: string
        password: string
        role?: 'admin' | 'super_admin'
        is_active?: boolean
      }
      if (!username || !email || !password) {
        res.status(400).json({ message: '缺少必填字段：username、email 或 password' })
        return
      }
      const item = await devAddUser({
        username,
        email,
        password,
        role: role || 'admin',
        is_active: typeof is_active === 'boolean' ? is_active : true,
        last_login_at: null
      })
      res.status(201).json({ item })
      return
    }
    res.status(500).json({ message: msg })
  }
})

/**
 * 更新用户
 * PUT /api/admin/users/:id
 */
router.put('/users/:id', verifyAdminToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getSupabase()
    const { id } = req.params
    const { 
      username, 
      email, 
      password, 
      role, 
      is_active 
    } = req.body as {
      username?: string
      email?: string
      password?: string
      role?: 'admin' | 'super_admin'
      is_active?: boolean
    }

    const updateData: Record<string, any> = {}
    if (username !== undefined) updateData.username = username
    if (email !== undefined) updateData.email = email
    if (password !== undefined) updateData.password = password // 注意：生产环境应该加密密码
    if (role !== undefined) updateData.role = role
    if (is_active !== undefined) updateData.is_active = is_active
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('admin_users')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      if (/schema cache/i.test(error.message) || error.code === 'PGRST002' || /fetch failed/i.test(error.message)) {
        console.warn('[admin routes] 用户更新降级为本地开发存储：', error.message)
        const item = await devUpdateUser(id, updateData)
        if (!item) {
          res.status(404).json({ message: '用户不存在' })
          return
        }
        res.status(200).json({ item })
        return
      }
      res.status(500).json({ message: '更新用户失败', error: error.message })
      return
    }

    if (!data || data.length === 0) {
      res.status(404).json({ message: '用户不存在' })
      return
    }

    res.status(200).json({ item: data[0] })
  } catch (err) {
    // 当 Supabase 客户端初始化失败（环境变量缺失）时，降级为本地开发存储
    const msg = err instanceof Error ? err.message : '服务器错误'
    if (err instanceof Error && (/缺少 Supabase/i.test(err.message) || /Supabase/i.test(err.message))) {
      console.warn('[admin routes] 用户更新降级为本地开发存储（客户端初始化失败）：', err.message)
      const { id } = req.params
      const patch = req.body as {
        username?: string
        email?: string
        password?: string
        role?: 'admin' | 'super_admin'
        is_active?: boolean
      }
      const item = await devUpdateUser(id, patch)
      if (!item) {
        res.status(404).json({ message: '用户不存在' })
        return
      }
      res.status(200).json({ item })
      return
    }
    res.status(500).json({ message: msg })
  }
})

/**
 * 删除用户
 * DELETE /api/admin/users/:id
 */
router.delete('/users/:id', verifyAdminToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getSupabase()
    const { id } = req.params

    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', id)

    if (error) {
      if (/schema cache/i.test(error.message) || error.code === 'PGRST002' || /fetch failed/i.test(error.message)) {
        console.warn('[admin routes] 用户删除降级为本地开发存储：', error.message)
        const ok = await devDeleteUser(id)
        if (!ok) {
          res.status(404).json({ message: '用户不存在' })
          return
        }
        res.status(200).json({ success: true })
        return
      }
      res.status(500).json({ message: '删除用户失败', error: error.message })
      return
    }

    // 返回 200 并携带 JSON，避免前端在某些环境中将 204 视为已中止（ERR_ABORTED）
    res.status(200).json({ success: true })
  } catch (err) {
    // 当 Supabase 客户端初始化失败（环境变量缺失）时，降级为本地开发存储
    const msg = err instanceof Error ? err.message : '服务器错误'
    if (err instanceof Error && (/缺少 Supabase/i.test(err.message) || /Supabase/i.test(err.message))) {
      console.warn('[admin routes] 用户删除降级为本地开发存储（客户端初始化失败）：', err.message)
      const { id } = req.params
      const ok = await devDeleteUser(id)
      if (!ok) {
        res.status(404).json({ message: '用户不存在' })
        return
      }
      res.status(200).json({ success: true })
      return
    }
    res.status(500).json({ message: msg })
  }
})

export default router