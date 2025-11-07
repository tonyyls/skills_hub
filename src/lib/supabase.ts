/**
 * Supabase客户端配置
 * 提供数据库连接和认证功能
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

/**
 * 数据库表名常量
 */
export const TABLES = {
  USERS: 'users',
  SKILLS: 'skills',
  CATEGORIES: 'categories',
  TAGS: 'tags',
  SKILL_TAGS: 'skill_tags',
  DOWNLOADS: 'downloads'
} as const

/**
 * 技能分类枚举
 */
export const SKILL_CATEGORIES = {
  PROGRAMMING: '编程开发',
  DESIGN: '设计创意',
  DATA_ANALYSIS: '数据分析',
  PRODUCT_OPS: '产品运营',
  OTHER: '其他'
} as const

export type SkillCategory = keyof typeof SKILL_CATEGORIES

/**
 * 用户类型定义
 */
export interface User {
  id: string
  github_id: string
  username: string
  email?: string
  avatar_url?: string
  github_url?: string
  /**
   * 角色：'admin' | 'normal'
   * GitHub 登录默认 normal；内置管理员为 admin
   */
  role?: 'admin' | 'normal'
  created_at: string
  updated_at: string
}

/**
 * 技能类型定义
 */
export interface Skill {
  id: string
  user_id: string
  title: string
  description: string
  content?: string
  category_id: string
  file_url?: string
  download_count: number
  created_at: string
  updated_at: string
  author?: User
  category?: Category
  tags?: Tag[]
}

/**
 * 分类类型定义
 */
export interface Category {
  id: string
  name: string
  description?: string
  sort_order: number
  created_at: string
}

/**
 * 标签类型定义
 */
export interface Tag {
  id: string
  name: string
  created_at: string
}

/**
 * 下载记录类型定义
 */
export interface Download {
  id: string
  user_id: string
  skill_id: string
  downloaded_at: string
}