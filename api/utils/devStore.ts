import fs from 'fs/promises'
import path from 'path'

const dataDir = path.join(process.cwd(), 'api', 'data')
const categoriesFile = path.join(dataDir, 'categories.dev.json')
const skillsFile = path.join(dataDir, 'skills.dev.json')
const usersFile = path.join(dataDir, 'users.dev.json')

export interface DevCategory {
  id: string
  name: string
  name_en?: string | null
  slug: string
  description?: string | null
  description_en?: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at?: string
}

export interface DevSkill {
  id: string
  title: string
  title_en?: string | null
  description?: string | null
  description_en?: string | null
  content: string
  content_en?: string | null
  category_id: string
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  estimated_time?: number | null
  tags: string[]
  status: 'draft' | 'published' | 'archived'
  view_count: number
  like_count: number
  featured: boolean
  created_at: string
  updated_at?: string
}

export interface DevUser {
  id: string
  username: string
  email: string
  /**
   * 仅开发环境使用的明文密码字段。
   * 生产环境必须使用安全的哈希存储。
   */
  password?: string | null
  role: 'admin' | 'super_admin'
  is_active: boolean
  last_login_at?: string | null
  created_at: string
  updated_at?: string
}

/**
 * 确保开发数据文件存在。
 * 若目录或文件缺失则创建空文件。
 */
async function ensureFile(): Promise<void> {
  try {
    await fs.mkdir(dataDir, { recursive: true })
    await fs.access(categoriesFile).catch(async () => {
      await fs.writeFile(categoriesFile, '[]', 'utf-8')
    })
    await fs.access(skillsFile).catch(async () => {
      await fs.writeFile(skillsFile, '[]', 'utf-8')
    })
    await fs.access(usersFile).catch(async () => {
      await fs.writeFile(usersFile, '[]', 'utf-8')
    })
  } catch {}
}

/**
 * 读取分类的开发数据列表。
 * @returns 分类数组（若解析失败则返回空数组）。
 */
export async function readCategories(): Promise<DevCategory[]> {
  await ensureFile()
  const buf = await fs.readFile(categoriesFile, 'utf-8')
  try {
    const data = JSON.parse(buf)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

/**
 * 写入分类的开发数据列表到本地 JSON 文件。
 * @param items 要写入的分类数组
 */
export async function writeCategories(items: DevCategory[]): Promise<void> {
  await ensureFile()
  await fs.writeFile(categoriesFile, JSON.stringify(items, null, 2), 'utf-8')
}

/**
 * 读取技能的开发数据列表。
 */
export async function readSkills(): Promise<DevSkill[]> {
  await ensureFile()
  const buf = await fs.readFile(skillsFile, 'utf-8')
  try {
    const data = JSON.parse(buf)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

/**
 * 写入技能的开发数据列表到本地 JSON 文件。
 */
export async function writeSkills(items: DevSkill[]): Promise<void> {
  await ensureFile()
  await fs.writeFile(skillsFile, JSON.stringify(items, null, 2), 'utf-8')
}

/**
 * 读取用户的开发数据列表。
 */
export async function readUsers(): Promise<DevUser[]> {
  await ensureFile()
  const buf = await fs.readFile(usersFile, 'utf-8')
  try {
    const data = JSON.parse(buf)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

/**
 * 写入用户的开发数据列表到本地 JSON 文件。
 */
export async function writeUsers(items: DevUser[]): Promise<void> {
  await ensureFile()
  await fs.writeFile(usersFile, JSON.stringify(items, null, 2), 'utf-8')
}

/**
 * 添加一个分类到开发存储（维护 slug 唯一）。
 * @param item 待添加的分类内容（不包含 id 和 created_at）
 * @returns 新增的分类对象
 * @throws slug 冲突时抛出错误
 */
export async function addCategory(item: Omit<DevCategory, 'id' | 'created_at'> & { id?: string }): Promise<DevCategory> {
  const list = await readCategories()
  const now = new Date().toISOString()
  const id = item.id || (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}`)
  const newItem: DevCategory = {
    id,
    name: item.name,
    name_en: item.name_en ?? null,
    slug: item.slug,
    description: item.description ?? null,
    description_en: item.description_en ?? null,
    is_active: item.is_active ?? true,
    sort_order: item.sort_order ?? 0,
    created_at: now,
    updated_at: now
  }
  // 唯一约束：slug
  if (list.some(c => c.slug === newItem.slug)) {
    throw new Error('slug 已存在，请更换')
  }
  list.push(newItem)
  await writeCategories(list)
  return newItem
}

/**
 * 添加一个技能到开发存储。
 * @param item 技能内容（不包含 id/created_at）
 */
export async function addSkill(item: Omit<DevSkill, 'id' | 'created_at' | 'view_count' | 'like_count'> & { id?: string }): Promise<DevSkill> {
  const list = await readSkills()
  const now = new Date().toISOString()
  const id = item.id || (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}`)
  const newItem: DevSkill = {
    id,
    title: item.title,
    title_en: item.title_en ?? null,
    description: item.description ?? null,
    description_en: item.description_en ?? null,
    content: item.content,
    content_en: item.content_en ?? null,
    category_id: item.category_id,
    difficulty_level: item.difficulty_level,
    estimated_time: item.estimated_time ?? null,
    tags: item.tags ?? [],
    status: item.status ?? 'draft',
    view_count: 0,
    like_count: 0,
    featured: !!item.featured,
    created_at: now,
    updated_at: now
  }
  list.unshift(newItem)
  await writeSkills(list)
  return newItem
}

/**
 * 添加一个用户到开发存储。
 * @param item 用户内容（不包含 id/created_at/updated_at）
 */
export async function addUser(item: Omit<DevUser, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<DevUser> {
  const list = await readUsers()
  const now = new Date().toISOString()
  const id = item.id || (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}`)
  const newItem: DevUser = {
    id,
    username: item.username,
    email: item.email,
    password: item.password ?? null,
    role: item.role ?? 'admin',
    is_active: item.is_active ?? true,
    last_login_at: item.last_login_at ?? null,
    created_at: now,
    updated_at: now
  }
  // 简单的唯一约束：用户名或邮箱重复则更新为不重复（开发环境）
  const conflict = list.find(u => u.username === newItem.username || u.email === newItem.email)
  if (conflict) {
    newItem.username = `${newItem.username}-${Math.random().toString(16).slice(2, 6)}`
    newItem.email = `${Math.random().toString(16).slice(2, 6)}+${newItem.email}`
  }
  list.unshift(newItem)
  await writeUsers(list)
  return newItem
}

/**
 * 更新一个技能（按 id）。
 */
export async function updateSkill(id: string, patch: Partial<DevSkill>): Promise<DevSkill | null> {
  const list = await readSkills()
  const idx = list.findIndex(s => s.id === id)
  if (idx === -1) return null
  const updated = { ...list[idx], ...patch, updated_at: new Date().toISOString() }
  list[idx] = updated
  await writeSkills(list)
  return updated
}

/**
 * 更新一个用户（按 id）。
 */
export async function updateUser(id: string, patch: Partial<DevUser>): Promise<DevUser | null> {
  const list = await readUsers()
  const idx = list.findIndex(u => u.id === id)
  if (idx === -1) return null
  const updated: DevUser = { ...list[idx], ...patch, updated_at: new Date().toISOString() }
  list[idx] = updated
  await writeUsers(list)
  return updated
}

/**
 * 删除一个技能（按 id）。
 */
export async function deleteSkill(id: string): Promise<boolean> {
  const list = await readSkills()
  const next = list.filter(s => s.id !== id)
  await writeSkills(next)
  return next.length !== list.length
}

/**
 * 删除一个用户（按 id）。
 */
export async function deleteUser(id: string): Promise<boolean> {
  const list = await readUsers()
  const next = list.filter(u => u.id !== id)
  await writeUsers(next)
  return next.length !== list.length
}

/**
 * 更新一个分类（按 id 定位，维护 slug 唯一）。
 * @param id 分类ID
 * @param patch 更新内容
 * @returns 更新后的分类；不存在则返回 null
 * @throws slug 冲突时抛出错误
 */
export async function updateCategory(id: string, patch: Partial<DevCategory>): Promise<DevCategory | null> {
  const list = await readCategories()
  const idx = list.findIndex(c => c.id === id)
  if (idx === -1) return null
  const updated = { ...list[idx], ...patch, updated_at: new Date().toISOString() }
  // 保证 slug 唯一
  if (updated.slug && list.some(c => c.slug === updated.slug && c.id !== id)) {
    throw new Error('slug 已存在，请更换')
  }
  list[idx] = updated
  await writeCategories(list)
  return updated
}

/**
 * 删除一个分类（按 id）。
 * @param id 分类ID
 * @returns 是否有分类被删除
 */
export async function deleteCategory(id: string): Promise<boolean> {
  const list = await readCategories()
  const next = list.filter(c => c.id !== id)
  await writeCategories(next)
  return next.length !== list.length
}