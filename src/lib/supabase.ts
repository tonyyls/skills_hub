/**
 * Supabase客户端配置
 * 提供数据库连接和认证功能
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** 是否已配置 Supabase 环境变量 */
export const supabaseEnabled = Boolean(supabaseUrl && supabaseAnonKey)

if (!supabaseEnabled) {
  // 软失败：在开发/缺省环境不抛出致命错误，允许前端使用示例数据回退
  // 使用不可达占位域名，避免误向生产发起请求
  console.warn('[Supabase] 未配置 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY，客户端将不可用，前端会使用示例数据。')
}

export const supabase = createClient(
  supabaseEnabled ? supabaseUrl! : 'https://invalid.supabase.local',
  supabaseEnabled ? supabaseAnonKey! : 'invalid-anon-key',
  {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
}
)

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
 * 用户资料统一类型
 * 将管理员与普通用户的字段对齐到前端使用的显示模型。
 */
export interface UserProfile {
  id: string
  name: string
  email?: string
  avatar?: string
  avatar_url?: string
  bio?: string
  createdAt: string
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
  /** Git 仓库地址（可选） */
  git_url?: string
  /** 安装命令或说明（可选） */
  install_command?: string
  /** 是否精选 */
  featured?: boolean
  /** 是否推荐 */
  recommended?: boolean
  download_count: number
  created_at: string
  updated_at: string
  /** 可选的作者名称（展示），与 author_id 分离 */
  author_name?: string
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