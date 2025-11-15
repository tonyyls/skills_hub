/**
 * 管理员登录路由
 * 提供基于用户名/密码的管理员登录（仅用于开发/演示）。
 * 警告：生产环境请使用安全的身份验证与加密存储，避免硬编码凭据。
 */
import { Router, type Request, type Response } from 'express'
import jwt from 'jsonwebtoken'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { verifyPassword as devVerifyPassword } from '../utils/crypto.js'
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
  deleteUser as devDeleteUser,
  readLinks,
  addLink as devAddLink,
  updateLink as devUpdateLink,
  deleteLink as devDeleteLink
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
 * 规范化请求中的 tags 字段为字符串数组。
 * - 支持字符串（以逗号分隔），对象数组（取 `name`），或已是字符串数组。
 * - 去除空白、去重、过滤空值。
 * @param raw 任意原始输入（可能为 string | string[] | any[] | null/undefined）
 * @returns 规范化后的标签字符串数组
 */
const normalizeTags = (raw: any): string[] => {
  try {
    if (!raw) return []
    if (Array.isArray(raw)) {
      const arr = raw.map((t: any) => typeof t === 'string' ? t : (t?.name || ''))
      return Array.from(new Set(arr.map((t: string) => t.trim()).filter(Boolean)))
    }
    if (typeof raw === 'string') {
      return Array.from(new Set(raw.split(',').map(s => s.trim()).filter(Boolean)))
    }
    return []
  } catch {
    return []
  }
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
    if (payload.role !== 'admin' && payload.role !== 'super_admin') {
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

    // 1) 固定环境变量账号优先，兼容现有开发/演示登录
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      if (!ADMIN_JWT_SECRET) {
        res.status(500).json({ message: '服务器配置错误：缺少 ADMIN_JWT_SECRET' })
        return
      }
      const token = jwt.sign(
        { sub: 'admin', username: ADMIN_USERNAME, role: 'admin' },
        ADMIN_JWT_SECRET,
        { expiresIn: '24h', issuer: 'skills-hub' }
      )
      const user = {
        id: 'admin',
        username: ADMIN_USERNAME,
        email: '',
        role: 'admin' as const,
        is_active: true,
        created_at: new Date().toISOString()
      }
      res.status(200).json({ token, user })
      return
    }

    // 2) 失败则尝试从数据库 admin_users 表进行验证
    try {
      const supabase = getSupabase()
      const { data: rows, error: qryErr } = await supabase
        .from('admin_users')
        .select('id, username, email, role, is_active, password_hash, last_login_at, created_at, updated_at')
        .or(`username.eq.${username},email.eq.${username}`)
        .limit(1)
      if (qryErr) throw qryErr
      const admin = rows?.[0]
      if (!admin) {
        res.status(401).json({ message: '用户名或密码错误' })
        return
      }

      // 优先使用数据库RPC进行 bcrypt 校验
      let ok = false
      try {
        const { data: rpcOk, error: rpcErr } = await supabase.rpc('verify_admin_user_password', {
          p_id: admin.id,
          p_password: password
        })
        if (!rpcErr) ok = Boolean(rpcOk)
      } catch {}

      // 回退：若为PBKDF2格式（开发存储），使用本地校验
      if (!ok && typeof admin.password_hash === 'string' && admin.password_hash.startsWith('pbkdf2$')) {
        ok = devVerifyPassword(password, admin.password_hash)
      }

      if (!ok) {
        res.status(401).json({ message: '用户名或密码错误' })
        return
      }

      // 校验通过，更新最后登录时间
      try {
        await supabase
          .from('admin_users')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', admin.id)
      } catch {}

      // 生成 JWT：使用数据库管理员信息
      if (!ADMIN_JWT_SECRET) {
        res.status(500).json({ message: '服务器配置错误：缺少 ADMIN_JWT_SECRET' })
        return
      }
      const token = jwt.sign(
        { sub: String(admin.id), username: admin.username, role: admin.role || 'admin' },
        ADMIN_JWT_SECRET,
        { expiresIn: '24h', issuer: 'skills-hub' }
      )
      const user = {
        id: String(admin.id),
        username: admin.username,
        email: admin.email || '',
        role: (admin.role || 'admin') as 'admin' | 'super_admin',
        is_active: admin.is_active ?? true,
        last_login_at: admin.last_login_at || null,
        created_at: admin.created_at,
        updated_at: admin.updated_at || admin.created_at
      }
      res.status(200).json({ token, user })
      return
    } catch (e: any) {
      res.status(401).json({ message: '用户名或密码错误' })
      return
    }
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

    // 使用实际存在的表名 `categories`
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
        // 搜索集：name/description/content
        query = query.or(
          `name.ilike.%${q}%,description.ilike.%${q}%,content.ilike.%${q}%`
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
          const qOk = !q || [s.title, s.description, s.content]
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
 * 技能搜索（按 git_url 或 title+author_name 精确匹配）
 * GET /api/admin/skills/search?git_url=...&title=...&author_name=...
 */
router.get('/skills/search', verifyAdminToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getSupabase()
    const gitUrl = (req.query.git_url as string | undefined)?.trim()
    const title = (req.query.title as string | undefined)?.trim()
    const authorName = (req.query.author_name as string | undefined)?.trim()

    let query = supabase
      .from('skills')
      .select('*')
      .order('created_at', { ascending: false })

    if (gitUrl) query = query.eq('git_url', gitUrl)
    if (title) query = query.eq('name', title)
    if (authorName) query = query.eq('author_name', authorName)

    const { data, error } = await query.limit(50)
    if (error) throw error
    res.status(200).json({ items: data || [] })
  } catch (err: any) {
    // 降级为开发存储
    try {
      const gitUrl = (req.query.git_url as string | undefined)?.trim()
      const title = (req.query.title as string | undefined)?.trim()
      const authorName = (req.query.author_name as string | undefined)?.trim()
      const items = await readSkills()
      const filtered = items.filter(s => {
        const name = (s as any).title ?? (s as any).name
        const git = (s as any).git_url ?? (s as any).repo_url
        const author = (s as any).author_name
        const okGit = gitUrl ? git === gitUrl : true
        const okTitle = title ? name === title : true
        const okAuthor = authorName ? author === authorName : true
        return okGit && okTitle && okAuthor
      })
      res.status(200).json({ items: filtered })
    } catch (e: any) {
      const msg = err instanceof Error ? err.message : '服务器错误'
      res.status(500).json({ message: msg })
    }
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
    const required = ['title']
    for (const k of required) {
      if (!body?.[k]) {
        res.status(400).json({ message: `缺少必填字段：${k}` })
        return
      }
    }
    const payload: Record<string, any> = {
      // 映射到当前数据库列
      name: String(body.title),
      description: body.description ?? null,
      category_id: body.category_id || null,
      featured: !!body.featured,
      // 推荐字段持久化
      recommended: !!body.recommended,
      // 数据库新增列（通过迁移添加）
      content: typeof body.content === 'string' ? body.content : null,
      // 标签数组（通过迁移添加 TEXT[]）
      tags: normalizeTags(body.tags),
      // 状态持久化（新增列）
      status: typeof body.status === 'string' && ['draft','published','archived'].includes(body.status) ? body.status : 'draft',
      published_at: body.status === 'published' ? new Date().toISOString() : null,
      // 可选作者展示名（已通过迁移添加）
      author_name: (typeof body.author_name === 'string' && body.author_name.trim() ? body.author_name.trim().slice(0, 50) : null),
      // author_id 在当前库为非空约束，后续迁移放宽为可空
      author_id: body.author_id || null,
      // Git地址与安装命令（新增列，空值写入 null）
      git_url: (typeof body.git_url === 'string' && body.git_url.trim().length > 0) ? body.git_url.trim() : null,
      install_command: (typeof body.install_command === 'string' && body.install_command.trim().length > 0) ? body.install_command.trim() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    const { data, error } = await supabase.from('skills').insert(payload).select()
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
    const body = req.body as any
    const patch: Record<string, any> = { updated_at: new Date().toISOString() }
    const fields = ['title','description','content','category_id','featured','recommended','author_name','author_id','status','tags','git_url','install_command']
    for (const k of fields) {
      if (body[k] !== undefined) {
        if (k === 'title') patch.name = String(body.title)
        else if (k === 'author_name') patch.author_name = (typeof body.author_name === 'string' && body.author_name.trim() ? body.author_name.trim().slice(0, 50) : null)
        else if (k === 'author_id') {
          const v = body.author_id
          patch.author_id = (typeof v === 'string' && v.trim().length > 0) ? v : null
        }
        else if (k === 'category_id') {
          const v = body.category_id
          patch.category_id = (typeof v === 'string' && v.trim().length > 0) ? v : null
        }
        else if (k === 'featured' || k === 'recommended') {
          patch[k] = !!body[k]
        }
        else if (k === 'status') {
          const v = String(body.status)
          patch.status = ['draft','published','archived'].includes(v) ? v : 'draft'
          patch.published_at = patch.status === 'published' ? new Date().toISOString() : null
        }
        else if (k === 'tags') {
          patch.tags = normalizeTags(body.tags)
        }
        else if (k === 'git_url' || k === 'install_command') {
          const v = body[k]
          patch[k] = (typeof v === 'string' && v.trim().length > 0) ? v.trim() : null
        }
        else if (k === 'description' || k === 'content') {
          const v = body[k]
          patch[k] = (typeof v === 'string' && v.trim().length > 0) ? v : null
        }
        else patch[k] = body[k]
      }
    }
    const { data, error } = await supabase.from('skills').update(patch).eq('id', id).select()
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
    const body = req.body as any
    if (!body?.title || !body?.content) {
      res.status(400).json({ message: '缺少必填字段：title 或 content' })
      return
    }
    const insertData: Record<string, any> = {
      name: String(body.title),
      description: body.description ?? null,
      content: typeof body.content === 'string' ? body.content : null,
      category_id: (typeof body.category_id === 'string' && body.category_id.trim().length > 0) ? body.category_id : null,
      featured: !!body.featured,
      recommended: !!body.recommended,
      author_name: (typeof body.author_name === 'string' && body.author_name.trim() ? body.author_name.trim().slice(0, 50) : null),
      author_id: (typeof body.author_id === 'string' && body.author_id.trim().length > 0) ? body.author_id : null,
      git_url: (typeof body.git_url === 'string' && body.git_url.trim().length > 0) ? body.git_url.trim() : null,
      install_command: (typeof body.install_command === 'string' && body.install_command.trim().length > 0) ? body.install_command.trim() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
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
    const body = req.body as any
    const updateData: Record<string, any> = { updated_at: new Date().toISOString() }
    const fields = ['title','description','content','category_id','featured','recommended','author_name','author_id','git_url','install_command']
    for (const k of fields) {
      if (body[k] !== undefined) {
        if (k === 'title') updateData.name = String(body.title)
        else if (k === 'author_name') updateData.author_name = (typeof body.author_name === 'string' && body.author_name.trim() ? body.author_name.trim().slice(0, 50) : null)
        else if (k === 'author_id') {
          const v = body.author_id
          updateData.author_id = (typeof v === 'string' && v.trim().length > 0) ? v : null
        }
        else if (k === 'category_id') {
          const v = body.category_id
          updateData.category_id = (typeof v === 'string' && v.trim().length > 0) ? v : null
        }
        else if (k === 'featured' || k === 'recommended') {
          updateData[k] = !!body[k]
        }
        else if (k === 'git_url' || k === 'install_command') {
          const v = body[k]
          updateData[k] = (typeof v === 'string' && v.trim().length > 0) ? v.trim() : null
        }
        else if (k === 'description' || k === 'content') {
          const v = body[k]
          updateData[k] = (typeof v === 'string' && v.trim().length > 0) ? v : null
        }
        else updateData[k] = body[k]
      }
    }

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
/**
 * 获取真实网站用户列表。
 *
 * 通过 Supabase 管理接口 `auth.admin.listUsers()` 拉取 `auth.users`，
 * 再关联合并 `public.user_profiles` 资料（角色、激活状态、最近登录等）。
 * 支持按用户名或邮箱搜索，按创建时间倒序排序。
 *
 * @param req Express Request（支持查询参数 `q`）
 * @param res Express Response（返回 `{ items: User[] }`）
 * @returns void
 */
router.get('/users', verifyAdminToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getSupabase()
    const q = (req.query.q as string | undefined)?.trim()

    // 使用管理接口列出所有 auth 用户
    const { data: listRes, error: listErr } = await (supabase as any).auth.admin.listUsers()
    if (listErr) throw listErr
    const users = listRes?.users ?? []

    // 批量查询 user_profiles 并进行合并
    const ids = users.map((u: any) => u.id)
    const { data: profiles, error: profErr } = await supabase
      .from('user_profiles')
      .select('*')
      .in('user_id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000'])
    if (profErr) throw profErr

    // 额外查询 public.users（自定义用户基础信息表）以获取 username 作为次级来源
    // 注意：此表不是 Supabase Auth 的系统表，仅用于补充用户名来源，优先级低于 user_profiles
    let basicMap: Map<string, any> = new Map()
    try {
      const { data: basicUsers, error: basicErr } = await supabase
        .from('users')
        .select('id, username')
        .in('id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000'])
      if (!basicErr && Array.isArray(basicUsers)) {
        basicMap = new Map<string, any>((basicUsers || []).map((bu: any) => [bu.id, bu]))
      }
    } catch {}

    const profMap = new Map<string, any>((profiles || []).map(p => [p.user_id, p]))

    // 组装前端所需结构
    let items = users.map((u: any) => {
      const p = profMap.get(u.id)
      const bu = basicMap.get(u.id)
      const username = p?.username || bu?.username || u.user_metadata?.username || u.email?.split('@')[0] || ''
      const role = p?.role || 'user'
      const isActive = p?.is_active ?? true
      return {
        id: u.id,
        username,
        email: u.email || '',
        role,
        is_active: isActive,
        last_login_at: u.last_sign_in_at || null,
        created_at: u.created_at,
        updated_at: p?.updated_at || u.created_at
      }
    })

    // 搜索过滤：用户名或邮箱
    if (q && q.length > 0) {
      const ql = q.toLowerCase()
      items = items.filter((i: any) =>
        [i.username, i.email].filter(Boolean).some(v => String(v).toLowerCase().includes(ql))
      )
    }

    // 按创建时间倒序排列
    items.sort((a: any, b: any) => (String(b.created_at).localeCompare(String(a.created_at))))
    res.status(200).json({ items })
  } catch (err: any) {
    // 降级：若 Supabase 管理接口不可用，退回本地开发存储
    console.warn('[admin routes] 真实用户查询失败，降级为本地开发存储：', err?.message)
    try {
      const q = (req.query.q as string | undefined)?.trim()
      const items = await readUsers()
      const filtered = q
        ? items.filter(u => [u.username, u.email]
            .filter(Boolean)
            .some(v => String(v).toLowerCase().includes(q!.toLowerCase())))
        : items
      filtered.sort((a, b) => (b.created_at.localeCompare(a.created_at)))
      res.status(200).json({ items: filtered })
    } catch (e: any) {
      res.status(500).json({ message: e?.message || '服务器错误' })
    }
  }
})

/**
 * 创建用户
 * POST /api/admin/users
 */
/**
 * 创建真实网站用户。
 *
 * 使用 Supabase 管理接口 `auth.admin.createUser()` 创建 `auth.users`（邮箱+密码），
 * 并初始化 `public.user_profiles` 资料（用户名、角色、激活状态）。
 * 若管理接口不可用，降级使用本地开发存储。
 *
 * @param req Express Request（body：`email`, `password`, 可选 `username`, `role`, `is_active`）
 * @param res Express Response（返回 `{ item: User }`）
 * @returns void
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
      username?: string
      email: string
      password: string
      role?: 'user' | 'admin' | 'super_admin'
      is_active?: boolean
    }

    if (!email || !password) {
      res.status(400).json({ message: '缺少必填字段：email 或 password' })
      return
    }

    // 创建 auth 用户
    const { data: createRes, error: createErr } = await (supabase as any).auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username }
    })
    if (createErr) throw createErr
    const user = createRes.user
    if (!user) {
      res.status(500).json({ message: '创建用户失败：返回结果为空' })
      return
    }

    // 初始化资料
    const { data: profRes, error: profErr } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        username: username || email.split('@')[0],
        role: role || 'user',
        is_active: typeof is_active === 'boolean' ? is_active : true,
        last_login_at: null
      })
      .select()
    if (profErr) throw profErr

    const p = profRes?.[0]
    res.status(201).json({ item: {
      id: user.id,
      username: p?.username || username || email.split('@')[0],
      email: user.email || email,
      role: p?.role || role || 'user',
      is_active: p?.is_active ?? true,
      last_login_at: user.last_sign_in_at || null,
      created_at: user.created_at,
      updated_at: p?.updated_at || user.created_at
    } })
  } catch (err: any) {
    // 降级：开发环境本地存储
    console.warn('[admin routes] 真实用户创建失败，降级为本地开发存储：', err?.message)
    try {
      const { username, email, password, role, is_active } = req.body as {
        username?: string
        email: string
        password: string
        role?: 'user' | 'admin' | 'super_admin'
        is_active?: boolean
      }
      if (!email || !password) {
        res.status(400).json({ message: '缺少必填字段：email 或 password' })
        return
      }
      const item = await devAddUser({
        username: username || email.split('@')[0],
        email,
        password,
        role: role || 'user',
        is_active: typeof is_active === 'boolean' ? is_active : true,
        last_login_at: null
      })
      res.status(201).json({ item })
    } catch (e: any) {
      res.status(500).json({ message: e?.message || '服务器错误' })
    }
  }
})

/**
 * 更新用户
 * PUT /api/admin/users/:id
 */
/**
 * 更新真实网站用户资料与凭据。
 *
 * 通过 `auth.admin.updateUserById()` 更新邮箱或密码；
 * 通过 `public.user_profiles` 更新用户名、角色、激活状态。
 * 返回合并后的统一用户结构。
 * 若管理接口不可用，降级使用本地开发存储。
 *
 * @param req Express Request（params：`id`，body：可选 `email`, `password`, `username`, `role`, `is_active`）
 * @param res Express Response（返回 `{ item: User }`）
 * @returns void
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
      role?: 'user' | 'admin' | 'super_admin'
      is_active?: boolean
    }

    // 更新 auth 用户邮箱/密码
    if (email || password) {
      const { error: updErr } = await (supabase as any).auth.admin.updateUserById(id, {
        ...(email ? { email } : {}),
        ...(password ? { password } : {})
      })
      if (updErr) throw updErr
    }

    // 更新资料表
    const patch: Record<string, any> = {}
    if (username !== undefined) patch.username = username
    if (role !== undefined) patch.role = role
    if (is_active !== undefined) patch.is_active = is_active
    let profile: any = null
    if (Object.keys(patch).length > 0) {
      const { data: profRes, error: profErr } = await supabase
        .from('user_profiles')
        .upsert({ user_id: id, ...patch })
        .select()
      if (profErr) throw profErr
      profile = profRes?.[0] || null
    }

    // 返回合并后的结构
    const { data: listRes, error: listErr } = await (supabase as any).auth.admin.getUserById(id)
    if (listErr) throw listErr
    const u = listRes.user
    if (!u) {
      res.status(404).json({ message: '用户不存在' })
      return
    }
    res.status(200).json({ item: {
      id: u.id,
      username: profile?.username || u.user_metadata?.username || u.email?.split('@')[0] || '',
      email: u.email || '',
      role: profile?.role || 'user',
      is_active: profile?.is_active ?? true,
      last_login_at: u.last_sign_in_at || null,
      created_at: u.created_at,
      updated_at: profile?.updated_at || u.created_at
    } })
  } catch (err: any) {
    // 降级：开发环境本地存储
    console.warn('[admin routes] 真实用户更新失败，降级为本地开发存储：', err?.message)
    try {
      const { id } = req.params
      const { username, email, password, role, is_active } = req.body as {
        username?: string
        email?: string
        password?: string
        role?: 'user' | 'admin' | 'super_admin'
        is_active?: boolean
      }
      const updateData: Record<string, any> = {}
      if (username !== undefined) updateData.username = username
      if (email !== undefined) updateData.email = email
      if (password !== undefined) updateData.password = password
      if (role !== undefined) updateData.role = role
      if (is_active !== undefined) updateData.is_active = is_active
      const item = await devUpdateUser(id, updateData)
      if (!item) {
        res.status(404).json({ message: '用户不存在' })
        return
      }
      res.status(200).json({ item })
    } catch (e: any) {
      res.status(500).json({ message: e?.message || '服务器错误' })
    }
  }
})

/**
 * 删除用户
 * DELETE /api/admin/users/:id
 */
/**
 * 删除真实网站用户。
 *
 * 使用 `auth.admin.deleteUser()` 删除 `auth.users`，
 * 并防御性清理 `public.user_profiles`（若未因外键级联删除），返回 `{ success: true }`。
 * 若管理接口不可用，降级使用本地开发存储。
 *
 * @param req Express Request（params：`id`）
 * @param res Express Response（返回 `{ success: true }`）
 * @returns void
 */
router.delete('/users/:id', verifyAdminToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getSupabase()
    const { id } = req.params
    const { error: delErr } = await (supabase as any).auth.admin.deleteUser(id)
    if (delErr) throw delErr
    // 额外清理（防御性）：若未级联成功，尝试删除资料
    await supabase.from('user_profiles').delete().eq('user_id', id)
    res.status(200).json({ success: true })
  } catch (err: any) {
    console.warn('[admin routes] 真实用户删除失败，降级为本地开发存储：', err?.message)
    try {
      const { id } = req.params
      const ok = await devDeleteUser(id)
      if (!ok) {
        res.status(404).json({ message: '用户不存在' })
        return
      }
      res.status(200).json({ success: true })
    } catch (e: any) {
      res.status(500).json({ message: e?.message || '服务器错误' })
    }
  }
})

/**
 * 获取管理员用户列表（admin_users）。
 *
 * 使用 `public.admin_users` 表，支持用户名与邮箱搜索，按创建时间倒序。
 * 严格区分于注册用户列表（/api/admin/users）。
 *
 * @route GET /api/admin/admin-users?q=关键词
 * @param req Express Request（支持查询参数 `q`）
 * @param res Express Response（返回 `{ items: AdminUser[] }`）
 * @returns void
 */
router.get('/admin-users', verifyAdminToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getSupabase()
    const q = (req.query.q as string | undefined)?.trim()

    let query = supabase
      .from('admin_users')
      .select('id, username, email, role, is_active, last_login_at, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (q && q.length > 0) {
      query = query.or(`username.ilike.%${q}%,email.ilike.%${q}%`)
    }

    const { data, error } = await query
    if (error) throw error
    res.status(200).json({ items: data || [] })
  } catch (err: any) {
    console.warn('[admin routes] 管理员用户查询失败，降级为本地开发存储：', err?.message)
    try {
      const q = (req.query.q as string | undefined)?.trim()
      const items = await readUsers()
      const filtered = q
        ? items.filter(u => [u.username, u.email]
            .filter(Boolean)
            .some(v => String(v).toLowerCase().includes(q!.toLowerCase())))
        : items
      filtered.sort((a, b) => (b.created_at.localeCompare(a.created_at)))
      // 注意：开发存储仅含管理员角色数据
      res.status(200).json({ items: filtered })
    } catch (e: any) {
      res.status(500).json({ message: e?.message || '服务器错误' })
    }
  }
})

/**
 * 创建管理员用户。
 *
 * 安全：通过 RPC `create_admin_user` 在数据库服务端进行密码哈希（pgcrypto）。
 * 若 Supabase 后端不可用，降级使用本地开发存储（仅开发模式）。
 *
 * @route POST /api/admin/admin-users
 * @param req Express Request（body：`username`, `email`, `password`, 可选 `role`, `is_active`）
 * @param res Express Response（返回 `{ item: AdminUser }`）
 * @returns void
 */
router.post('/admin-users', verifyAdminToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getSupabase()
    const { username, email, password, role, is_active } = req.body as {
      username: string
      email: string
      password: string
      role?: 'admin' | 'super_admin'
      is_active?: boolean
    }

    if (!username || !email || !password) {
      res.status(400).json({ message: '缺少必填字段：username / email / password' })
      return
    }

    // 通过 RPC 在数据库中进行哈希并插入
    const { data, error } = await supabase.rpc('create_admin_user', {
      p_username: username,
      p_email: email,
      p_password: password,
      p_role: role || 'admin',
      p_is_active: typeof is_active === 'boolean' ? is_active : true
    })
    if (error) throw error
    res.status(201).json({ item: data })
  } catch (err: any) {
    console.warn('[admin routes] 管理员创建失败，降级为本地开发存储：', err?.message)
    try {
      const { username, email, password, role, is_active } = req.body as any
      const item = await devAddUser({
        username,
        email,
        password,
        role: role || 'admin',
        is_active: typeof is_active === 'boolean' ? is_active : true,
        last_login_at: null
      })
      res.status(201).json({ item })
    } catch (e: any) {
      res.status(500).json({ message: e?.message || '服务器错误' })
    }
  }
})

/**
 * 更新管理员用户。
 *
 * 可更新字段：`username`、`email`、`role`、`is_active`。
 * 若携带 `password`，则通过 RPC `update_admin_user_password` 在数据库中进行哈希更新。
 * 若 Supabase 后端不可用，降级本地开发存储。
 *
 * @route PUT /api/admin/admin-users/:id
 * @param req Express Request（params：`id`；body：可选 `username`, `email`, `role`, `is_active`, `password`）
 * @param res Express Response（返回 `{ item: AdminUser }`）
 * @returns void
 */
router.put('/admin-users/:id', verifyAdminToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getSupabase()
    const { id } = req.params
    const { username, email, role, is_active, password } = req.body as {
      username?: string
      email?: string
      role?: 'admin' | 'super_admin'
      is_active?: boolean
      password?: string
    }

    // 先更新普通字段
    const patch: Record<string, any> = {}
    if (username !== undefined) patch.username = username
    if (email !== undefined) patch.email = email
    if (role !== undefined) patch.role = role
    if (is_active !== undefined) patch.is_active = is_active

    if (Object.keys(patch).length > 0) {
      const { error: updErr } = await supabase
        .from('admin_users')
        .update(patch)
        .eq('id', id)
      if (updErr) throw updErr
    }

    // 若有密码，调用 RPC 进行哈希更新
    if (password) {
      const { error: pwdErr } = await supabase.rpc('update_admin_user_password', {
        p_id: id,
        p_password: password
      })
      if (pwdErr) throw pwdErr
    }

    const { data: rows, error } = await supabase
      .from('admin_users')
      .select('id, username, email, role, is_active, last_login_at, created_at, updated_at')
      .eq('id', id)
      .limit(1)
    if (error) throw error
    const item = rows?.[0]
    if (!item) {
      res.status(404).json({ message: '用户不存在' })
      return
    }
    res.status(200).json({ item })
  } catch (err: any) {
    console.warn('[admin routes] 管理员更新失败，降级为本地开发存储：', err?.message)
    try {
      const { id } = req.params
      const { username, email, role, is_active } = req.body as any
      const item = await devUpdateUser(id, {
        username,
        email,
        role,
        is_active
      })
      if (!item) {
        res.status(404).json({ message: '用户不存在' })
        return
      }
      res.status(200).json({ item })
    } catch (e: any) {
      res.status(500).json({ message: e?.message || '服务器错误' })
    }
  }
})

/**
 * 删除管理员用户。
 *
 * 从 `public.admin_users` 删除记录，返回 `{ success: true }`。
 * 若 Supabase 后端不可用，降级本地开发存储。
 *
 * @route DELETE /api/admin/admin-users/:id
 * @param req Express Request（params：`id`）
 * @param res Express Response（返回 `{ success: true }`）
 * @returns void
 */
router.delete('/admin-users/:id', verifyAdminToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getSupabase()
    const { id } = req.params
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', id)
    if (error) throw error
    res.status(200).json({ success: true })
  } catch (err: any) {
    console.warn('[admin routes] 管理员删除失败，降级为本地开发存储：', err?.message)
    try {
      const { id } = req.params
      const ok = await devDeleteUser(id)
      if (!ok) {
        res.status(404).json({ message: '用户不存在' })
        return
      }
      res.status(200).json({ success: true })
    } catch (e: any) {
      res.status(500).json({ message: e?.message || '服务器错误' })
    }
  }
})

/**
 * 友情链接管理路由
 */

// 获取友情链接列表
router.get('/links', verifyAdminToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('link_exchange')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
    
    if (error) throw error
    res.status(200).json({ items: data || [] })
  } catch (err: any) {
    console.warn('[admin routes] 获取友情链接失败，降级为本地开发存储：', err?.message)
    // 开发环境下返回模拟数据
    res.status(200).json({
      items: [
        {
          id: '1',
          name: 'Vue.js',
          url: 'https://vuejs.org/',
          description: '渐进式 JavaScript 框架',
          sort_order: 1,
          enabled: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Vite',
          url: 'https://vitejs.dev/',
          description: '下一代前端构建工具',
          sort_order: 2,
          enabled: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Vitest',
          url: 'https://vitest.dev/',
          description: '由 Vite 提供支持的极速单元测试框架',
          sort_order: 3,
          enabled: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    })
  }
})

// 创建友情链接
router.post('/links', verifyAdminToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getSupabase()
    const { name, url, description, sort_order, enabled } = req.body
    
    if (!name || !url) {
      res.status(400).json({ message: '缺少必填字段：name 或 url' })
      return
    }

    const { data, error } = await supabase
      .from('link_exchange')
      .insert([{
        name,
        url,
        description: description || '',
        sort_order: sort_order || 0,
        enabled: enabled !== undefined ? enabled : true
      }])
      .select()
      .single()
    
    if (error) throw error
    res.status(201).json({ item: data })
  } catch (err: any) {
    console.warn('[admin routes] 创建友情链接失败，降级为本地开发存储：', err?.message)
    try {
      const { name, url, description, sort_order, enabled } = req.body
      const item = await devAddLink({
        name,
        url,
        description,
        sort_order,
        enabled
      })
      res.status(201).json({ item })
    } catch (e: any) {
      res.status(500).json({ message: e?.message || '创建友情链接失败' })
    }
  }
})

// 更新友情链接
router.put('/links/:id', verifyAdminToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getSupabase()
    const { id } = req.params
    const { name, url, description, sort_order, enabled } = req.body
    
    const { data, error } = await supabase
      .from('link_exchange')
      .update({
        name,
        url,
        description,
        sort_order,
        enabled,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    res.status(200).json({ item: data })
  } catch (err: any) {
    console.warn('[admin routes] 更新友情链接失败，降级为本地开发存储：', err?.message)
    try {
      const { id } = req.params
      const { name, url, description, sort_order, enabled } = req.body
      const item = await devUpdateLink(id, {
        name,
        url,
        description,
        sort_order,
        enabled
      })
      if (!item) {
        res.status(404).json({ message: '友情链接不存在' })
        return
      }
      res.status(200).json({ item })
    } catch (e: any) {
      res.status(500).json({ message: e?.message || '更新友情链接失败' })
    }
  }
})

// 删除友情链接
router.delete('/links/:id', verifyAdminToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getSupabase()
    const { id } = req.params
    
    const { error } = await supabase
      .from('link_exchange')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    res.status(200).json({ success: true })
  } catch (err: any) {
    console.warn('[admin routes] 删除友情链接失败，降级为本地开发存储：', err?.message)
    try {
      const { id } = req.params
      const ok = await devDeleteLink(id)
      if (!ok) {
        res.status(404).json({ message: '友情链接不存在' })
        return
      }
      res.status(200).json({ success: true })
    } catch (e: any) {
      res.status(500).json({ message: e?.message || '删除友情链接失败' })
    }
  }
})

export default router
/**
 * 反馈读取（管理端）
 * GET /api/admin/feedback?page=1&limit=20&type=&source_id=&user_id=&q=&issue=
 */
router.get('/feedback', verifyAdminToken, async (req: Request, res: Response): Promise<void> => {
  try {
    let supabase: any
    try {
      supabase = getSupabase()
    } catch (e: any) {
      res.status(200).json({ items: [], page: 1, pageSize: 20, total: 0 })
      return
    }

    const page = Math.max(parseInt(String(req.query.page || '1'), 10) || 1, 1)
    const limit = Math.min(Math.max(parseInt(String(req.query.limit || '20'), 10) || 20, 1), 100)
    const type = (req.query.type as string | undefined)?.trim()
    const sourceId = (req.query.source_id as string | undefined)?.trim()
    const userId = (req.query.user_id as string | undefined)?.trim()
    const q = (req.query.q as string | undefined)?.trim()
    const issue = (req.query.issue as string | undefined)?.trim()

    let query = supabase
      .from('feedback')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (type) query = query.eq('type', type)
    if (sourceId) query = query.eq('source_id', sourceId)
    if (userId) query = query.eq('user_id', userId)
    if (q && q.length > 0) query = query.ilike('comment', `%${q}%`)
    if (issue && issue.length > 0) query = (query as any).contains('issues', [issue])

    const from = (page - 1) * limit
    const to = from + limit - 1
    const { data, error, count } = await query.range(from, to)
    if (error) {
      const msg = String(error?.message || '')
      if (/schema cache/i.test(msg) || error.code === 'PGRST002' || /fetch failed/i.test(msg)) {
        res.status(200).json({ items: [], page, pageSize: limit, total: 0 })
        return
      }
      res.status(500).json({ message: '查询反馈失败', error: error.message })
      return
    }
    res.status(200).json({ items: data || [], page, pageSize: limit, total: count ?? (data?.length || 0) })
  } catch {
    res.status(200).json({ items: [], page: 1, pageSize: 20, total: 0 })
  }
})
