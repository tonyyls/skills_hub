import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Skill, Category, Tag } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

export const useSkillsStore = defineStore('skills', () => {
  const skills = ref<Skill[]>([])
  const categories = ref<Category[]>([])
  // 分类名称映射（id -> name），避免页面重复请求
  const categoryMap = ref<Record<string, string>>({})
  const tags = ref<Tag[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const selectedCategory = ref<string>('')
  const currentPage = ref(1)
  const itemsPerPage = ref(12)

  /**
   * 过滤后的技能列表
   * - 文本搜索：标题/描述/标签名（兼容 Tag 对象或字符串）
   * - 分类筛选：优先使用 `category_id`，回退 `category.id`
   */
  const filteredSkills = computed(() => {
    let result = skills.value

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter((skill: any) => {
        const inTitle = String(skill.title || '').toLowerCase().includes(query)
        const inDesc = String(skill.description || '').toLowerCase().includes(query)
        const inTags = Array.isArray(skill.tags) && skill.tags.some((tag: any) => {
          const name = typeof tag === 'string' ? tag : (tag?.name || '')
          return String(name).toLowerCase().includes(query)
        })
        return inTitle || inDesc || inTags
      })
    }

    if (selectedCategory.value) {
      result = result.filter((skill: any) => {
        const cid = skill.category_id || skill.category?.id || ''
        return cid === selectedCategory.value
      })
    }

    return result
  })

  const paginatedSkills = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return filteredSkills.value.slice(start, end)
  })

  const totalPages = computed(() => Math.ceil(filteredSkills.value.length / itemsPerPage.value))

  const setSkills = (newSkills: Skill[]) => {
    skills.value = newSkills
  }

  const setCategories = (newCategories: Category[]) => {
    categories.value = newCategories
    // 同步构建映射
    categoryMap.value = Object.fromEntries((newCategories || []).map((c: Category) => [c.id as string, c.name]))
  }

  const setTags = (newTags: Tag[]) => {
    tags.value = newTags
  }

  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading
  }

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  const setSearchQuery = (query: string) => {
    searchQuery.value = query
    currentPage.value = 1
  }

  const setSelectedCategory = (category: string) => {
    selectedCategory.value = category
    currentPage.value = 1
  }

  const setCurrentPage = (page: number) => {
    currentPage.value = page
  }

  /**
   * 返回用于首页展示的内置示例技能数据。
   * 当 Supabase 查询失败或无数据时作为回退数据。
   * @param {('latest'|'featured')} kind 数据类型（仅用于示例标记 featured）
   * @returns {Skill[]} 示例技能数组
   */
  const getMockSkills = (kind: 'latest' | 'featured' = 'latest'): Skill[] => {
    const base: Skill[] = [
      {
        id: 'mock-1',
        user_id: 'mock-user',
        title: 'Vue 3 组件开发指南',
        description: '深入学习 Vue 3 组件开发与 TypeScript 集成',
        category_id: 'cat-fe',
        download_count: 128,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: ['Vue.js', '前端开发', 'TypeScript'],
        featured: true
      },
      {
        id: 'mock-2',
        user_id: 'mock-user',
        title: 'React Hooks 实战教程',
        description: '系统掌握 useState/useEffect 以及自定义 Hook',
        category_id: 'cat-fe',
        download_count: 256,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: ['React', '前端开发', 'JavaScript']
      },
      {
        id: 'mock-3',
        user_id: 'mock-user',
        title: 'Python 数据分析入门',
        description: '使用 pandas/numpy 进行数据处理与可视化',
        category_id: 'cat-da',
        download_count: 89,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: ['Python', '数据分析']
      }
    ]
    if (kind === 'featured') {
      return base.map(s => ({ ...s, featured: true }))
    }
    return base
  }

  /**
   * 从 Supabase 获取技能列表并映射为前端使用的字段结构。
   * - 将数据库列 `name` 映射为前端的 `title`，避免标题缺失。
   * - 兼容 `author_id` → `user_id`，`download_count`/`downloads`。
   * - 规范化 `tags` 为字符串数组，缺省置为空数组。
   */
  const fetchSkills = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: supabaseError } = await supabase
        .from('skills')
        .select('*')
        .order('created_at', { ascending: false })

      if (supabaseError) {
        console.warn('Supabase连接失败，使用模拟数据:', supabaseError)
        // 使用模拟数据
        const mockSkills: Skill[] = [
          {
            id: '1',
            user_id: 'user1',
            title: 'Vue 3 组件开发指南',
            description: '深入学习Vue 3组件开发，包含Composition API、TypeScript集成等高级技巧',
            category_id: '1',
            download_count: 128,
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-01-15T10:00:00Z',
            content: 'Vue 3组件开发的完整指南',
            tags: [
              { id: 'mock-vue', name: 'Vue.js', created_at: '1970-01-01T00:00:00Z' },
              { id: 'mock-fe', name: '前端开发', created_at: '1970-01-01T00:00:00Z' },
              { id: 'mock-ts', name: 'TypeScript', created_at: '1970-01-01T00:00:00Z' }
            ]
          },
          {
            id: '2',
            user_id: 'user2',
            title: 'React Hooks 实战教程',
            description: '从零开始学习React Hooks，包含useState、useEffect、自定义Hook等',
            category_id: '1',
            download_count: 256,
            created_at: '2024-01-14T09:30:00Z',
            updated_at: '2024-01-14T09:30:00Z',
            content: 'React Hooks完整教程',
            tags: [
              { id: 'mock-react', name: 'React', created_at: '1970-01-01T00:00:00Z' },
              { id: 'mock-fe', name: '前端开发', created_at: '1970-01-01T00:00:00Z' },
              { id: 'mock-js', name: 'JavaScript', created_at: '1970-01-01T00:00:00Z' }
            ]
          },
          {
            id: '3',
            user_id: 'user3',
            title: 'Figma UI设计系统',
            description: '构建完整的设计系统，包含颜色、字体、组件库等设计规范',
            category_id: '2',
            download_count: 89,
            created_at: '2024-01-13T14:20:00Z',
            updated_at: '2024-01-13T14:20:00Z',
            content: 'Figma设计系统构建指南',
            tags: [
              { id: 'mock-figma', name: 'Figma', created_at: '1970-01-01T00:00:00Z' },
              { id: 'mock-ui', name: 'UI设计', created_at: '1970-01-01T00:00:00Z' },
              { id: 'mock-design-system', name: '设计系统', created_at: '1970-01-01T00:00:00Z' }
            ]
          },
          {
            id: '4',
            user_id: 'user4',
            title: 'Python数据分析实战',
            description: '使用Python进行数据分析，包含pandas、numpy、matplotlib等库的使用',
            category_id: '3',
            download_count: 167,
            created_at: '2024-01-12T11:15:00Z',
            updated_at: '2024-01-12T11:15:00Z',
            content: 'Python数据分析完整教程',
            tags: [
              { id: 'mock-python', name: 'Python', created_at: '1970-01-01T00:00:00Z' },
              { id: 'mock-data', name: '数据分析', created_at: '1970-01-01T00:00:00Z' },
              { id: 'mock-ml', name: '机器学习', created_at: '1970-01-01T00:00:00Z' }
            ]
          },
          {
            id: '5',
            user_id: 'user5',
            title: '产品经理实战手册',
            description: '从需求分析到产品上线的完整流程，适合初级产品经理学习',
            category_id: '4',
            download_count: 203,
            created_at: '2024-01-11T16:45:00Z',
            updated_at: '2024-01-11T16:45:00Z',
            content: '产品经理工作指南',
            tags: [
              { id: 'mock-pm', name: '产品管理', created_at: '1970-01-01T00:00:00Z' },
              { id: 'mock-req', name: '需求分析', created_at: '1970-01-01T00:00:00Z' },
              { id: 'mock-project', name: '项目管理', created_at: '1970-01-01T00:00:00Z' }
            ]
          },
          {
            id: '6',
            user_id: 'user6',
            title: 'TypeScript高级技巧',
            description: '深入学习TypeScript高级特性，包含泛型、装饰器、模块系统等',
            category_id: '1',
            download_count: 342,
            created_at: '2024-01-10T13:30:00Z',
            updated_at: '2024-01-10T13:30:00Z',
            content: 'TypeScript高级编程指南',
            tags: [
              { id: 'mock-ts', name: 'TypeScript', created_at: '1970-01-01T00:00:00Z' },
              { id: 'mock-fe', name: '前端开发', created_at: '1970-01-01T00:00:00Z' },
              { id: 'mock-js', name: 'JavaScript', created_at: '1970-01-01T00:00:00Z' }
            ]
          }
        ]
        setSkills(mockSkills)
      } else {
        // 将 Supabase 返回的字段映射为前端 Skill 结构
        const mapped = (data || []).map((row: any) => ({
          id: row.id,
          user_id: row.author_id || row.user_id || '',
          title: row.title || row.name || '未命名技能',
          description: row.description || '',
          content: row.content || '',
          category_id: row.category_id || row.category?.id || '',
          featured: !!row.featured,
          recommended: !!row.recommended,
          download_count: typeof row.download_count === 'number' ? row.download_count : (row.downloads ?? 0),
          created_at: row.created_at,
          updated_at: row.updated_at,
          author_name: row.author_name || '',
          // 规范 tags 为字符串数组
          tags: Array.isArray(row.tags)
            ? row.tags.map((t: any) => (typeof t === 'string' ? t : (t?.name || '')))
            : []
        }))

        /**
         * 补充作者信息：根据 `user_id` 批量查询 `users` 表并映射到 `author`。
         * - 避免 N+1 查询，先收集唯一 `user_id` 再一次性查询。
         * - 仅选择必要字段（id, username, avatar_url）。
         */
        const userIds = Array.from(new Set(mapped.map((s: any) => s.user_id).filter(Boolean)))
        if (userIds.length > 0) {
          const { data: authors, error: authorErr } = await supabase
            .from('users')
            .select('id, username, avatar_url')
            .in('id', userIds)

          if (authorErr) {
            console.warn('加载作者信息失败：', authorErr)
            setSkills(mapped as unknown as Skill[])
          } else {
            const authorMap = new Map<string, any>((authors || []).map(a => [a.id, a]))
            const withAuthor = mapped.map((s: any) => ({
              ...s,
              author: authorMap.get(s.user_id) || undefined
            }))
            setSkills(withAuthor as unknown as Skill[])
          }
        } else {
          setSkills(mapped as unknown as Skill[])
        }
      }
    } catch (err) {
      console.error('获取技能列表失败:', err)
      setError('数据库连接失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 获取最新技能列表（按创建时间倒序，仅已发布）。
   * 匿名访问受 RLS 限制，需过滤 `status = 'published'`。
   * 无模拟数据回退：错误时返回空数组。
   * @returns {Promise<Skill[]>} 最新技能数组（失败时为空）
   */
  const fetchLatestSkills = async (): Promise<Skill[]> => {
    console.log('[skillsStore] fetchLatestSkills:start')
    setLoading(true)
    setError(null)
    try {
      const { data, error: supabaseError } = await supabase
        .from('skills')
        .select('id, title:name, description, content, category_id, featured, recommended, download_count, author_id, author_name, tags, created_at, updated_at')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(24)

      if (supabaseError) {
        console.warn('[skillsStore] fetchLatestSkills:error', supabaseError?.message || supabaseError)
        setError(supabaseError?.message || '加载最新技能失败')
        setLoading(false)
        return []
      }
      const mapped = (data || []).map((row: any) => ({
        id: row.id,
        user_id: row.author_id || row.user_id || '',
        title: row.title || '未命名技能',
        description: row.description || '',
        content: row.content || '',
        category_id: row.category_id || row.category?.id || '',
        featured: !!row.featured,
        recommended: !!row.recommended,
        download_count: typeof row.download_count === 'number' ? row.download_count : (row.downloads ?? 0),
        created_at: row.created_at,
        updated_at: row.updated_at,
        author_name: row.author_name || '',
        tags: Array.isArray(row.tags)
          ? row.tags.map((t: any) => (typeof t === 'string' ? t : (t?.name || '')))
          : []
      }))
      console.log('[skillsStore] fetchLatestSkills:success', { count: mapped.length })
      setLoading(false)
      return mapped
    } catch (err) {
      console.error('[skillsStore] 获取最新技能失败:', err)
      setError((err as any)?.message || '加载最新技能异常')
      setLoading(false)
      return []
    }
  }

  /**
   * 获取精选技能列表（按创建时间倒序，仅已发布）。
    * 规则：featured=true 或 tags 包含“精选”。
    * - 使用两次查询合并去重，避免复杂 OR 语法不兼容导致的问题。
    * - 参考官方文档：
     *   - Query Filters contains/overlaps：https://supabase.com/docs/reference/javascript/select#filters
     *   - Realtime/Row Level Security 约束：https://supabase.com/docs/guides/auth#row-level-security
   * 无模拟数据回退：错误时返回空数组。
   * @returns {Promise<Skill[]>} 精选技能数组（失败时为空）
   */
  const fetchFeaturedSkills = async (): Promise<Skill[]> => {
    console.log('[skillsStore] fetchFeaturedSkills:start')
    setLoading(true)
    setError(null)
    try {
      // A: featured=true
      const { data: featuredRows, error: errA } = await supabase
        .from('skills')
        .select('id, title:name, description, content, category_id, featured, recommended, download_count, author_id, author_name, tags, created_at, updated_at')
        .eq('featured', true)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(24)

      // B: tags 包含“精选”
      const { data: taggedRows, error: errB } = await supabase
        .from('skills')
        .select('id, title:name, description, content, category_id, featured, recommended, download_count, author_id, author_name, tags, created_at, updated_at')
        .contains('tags', ['精选'])
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(24)

      if (errA && errB) {
        console.warn('[skillsStore] fetchFeaturedSkills:both queries error', errA || errB)
        setError((errA || errB)?.message || '加载精选技能失败')
        setLoading(false)
        return []
      }

      // 合并去重并按时间排序后截断 24 条
      const merged = [...(featuredRows || []), ...(taggedRows || [])]
      const unique = Array.from(new Map(merged.map((r: any) => [r.id, r])).values())
      unique.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      const finalRows = unique.slice(0, 24)

      const mapped = (finalRows || []).map((row: any) => ({
        id: row.id,
        user_id: row.author_id || row.user_id || '',
        title: row.title || '未命名技能',
        description: row.description || '',
        content: row.content || '',
        category_id: row.category_id || row.category?.id || '',
        featured: !!row.featured,
        recommended: !!row.recommended,
        download_count: typeof row.download_count === 'number' ? row.download_count : (row.downloads ?? 0),
        created_at: row.created_at,
        updated_at: row.updated_at,
        author_name: row.author_name || '',
        tags: Array.isArray(row.tags)
          ? row.tags.map((t: any) => (typeof t === 'string' ? t : (t?.name || '')))
          : []
      }))
      console.log('[skillsStore] fetchFeaturedSkills:success', { count: mapped.length })
      setLoading(false)
      return mapped
    } catch (err) {
      console.error('[skillsStore] 获取精选技能失败:', err)
      setError((err as any)?.message || '加载精选技能异常')
      setLoading(false)
      return []
    }
  }

  /**
   * 获取已发布技能总数（匿名可调用）。
   * 通过 RPC 函数 `public.get_published_skills_count()`，遵循 RLS 与调用者权限。
   * - 正常返回整数总数
   * - 异常或无数据时返回 0
   * 官方文档：
   * - Database Functions: https://supabase.com/docs/guides/database/functions
   * - JS RPC: https://supabase.com/docs/reference/javascript/rpc
   * @returns {Promise<number>} 已发布技能总数
   */
  const fetchTotalCount = async (): Promise<number> => {
    try {
      const { data, error } = await supabase.rpc('get_published_skills_count')
      if (error) {
        console.warn('获取技能总数失败：', error.message)
        return 0
      }
      const total = typeof data === 'number' ? data : 0
      return total
    } catch (e: any) {
      console.error('RPC 调用异常：', e?.message || e)
      return 0
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

      if (supabaseError) {
        console.warn('Supabase分类连接失败，使用模拟数据:', supabaseError)
        // 使用模拟分类数据
        const mockCategories: Category[] = [
          {
            id: '1',
            name: '前端开发',
            description: 'HTML, CSS, JavaScript, Vue, React等前端技术',
            created_at: '2024-01-01T00:00:00Z'
          },
          {
            id: '2',
            name: 'UI设计',
            description: 'Figma, Sketch, Adobe XD等设计工具和理论',
            created_at: '2024-01-01T00:00:00Z'
          },
          {
            id: '3',
            name: '数据分析',
            description: 'Python, R, SQL, Excel等数据分析工具',
            created_at: '2024-01-01T00:00:00Z'
          },
          {
            id: '4',
            name: '产品管理',
            description: '产品规划、需求分析、项目管理等产品技能',
            created_at: '2024-01-01T00:00:00Z'
          },
          {
            id: '5',
            name: '移动开发',
            description: 'iOS, Android, React Native, Flutter等移动开发技术',
            created_at: '2024-01-01T00:00:00Z'
          },
          {
            id: '6',
            name: '云计算',
            description: 'AWS, Azure, Google Cloud等云服务平台',
            created_at: '2024-01-01T00:00:00Z'
          }
        ]
        setCategories(mockCategories)
      } else {
        setCategories(data || [])
      }
    } catch (err) {
      console.error('获取分类失败:', err)
      // 使用模拟分类数据作为后备
      const mockCategories: Category[] = [
        {
          id: '1',
          name: '前端开发',
          description: 'HTML, CSS, JavaScript, Vue, React等前端技术',
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'UI设计',
          description: 'Figma, Sketch, Adobe XD等设计工具和理论',
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '3',
          name: '数据分析',
          description: 'Python, R, SQL, Excel等数据分析工具',
          created_at: '2024-01-01T00:00:00Z'
        }
      ]
      setCategories(mockCategories)
    }
  }

  /**
   * 确保分类数据已加载（含映射）。
   * - 若 categories 已有内容，直接构建/维持映射。
   * - 否则拉取 categories；若拉取失败可回退到 skill_categories。
   */
  const ensureCategoriesLoaded = async (): Promise<void> => {
    if ((categories.value && categories.value.length > 0) && Object.keys(categoryMap.value).length > 0) return
    // 尝试现有 categories 构建映射
    if (categories.value && categories.value.length > 0) {
      categoryMap.value = Object.fromEntries(categories.value.map((c: Category) => [c.id as string, c.name]))
      return
    }
    // 拉取 categories
    try {
      const { data, error } = await supabase.from('categories').select('id, name')
      if (!error && Array.isArray(data) && data.length > 0) {
        setCategories(data as Category[])
        return
      }
      // 回退到 skill_categories
      const { data: data2, error: error2 } = await supabase.from('skill_categories').select('id, name')
      if (!error2 && Array.isArray(data2) && data2.length > 0) {
        // 仅构建映射，不污染 categories 类型不一致
        categoryMap.value = Object.fromEntries((data2 as any[]).map((c: any) => [String(c.id), String(c.name)]))
      }
    } catch (e) {
      console.warn('ensureCategoriesLoaded 失败:', e)
    }
  }

  const fetchTags = async () => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('tags')
        .select('*')
        .order('name', { ascending: true })

      if (supabaseError) {
        console.warn('Supabase标签连接失败，使用模拟数据:', supabaseError)
        // 使用模拟标签数据
        const mockTags: Tag[] = [
          {
            id: '1',
            name: 'Vue.js',
            created_at: '2024-01-01T00:00:00Z'
          },
          {
            id: '2',
            name: 'React',
            created_at: '2024-01-01T00:00:00Z'
          },
          {
            id: '3',
            name: 'TypeScript',
            created_at: '2024-01-01T00:00:00Z'
          },
          {
            id: '4',
            name: 'Figma',
            created_at: '2024-01-01T00:00:00Z'
          },
          {
            id: '5',
            name: 'Python',
            created_at: '2024-01-01T00:00:00Z'
          },
          {
            id: '6',
            name: '产品管理',
            created_at: '2024-01-01T00:00:00Z'
          }
        ]
        setTags(mockTags)
      } else {
        setTags(data || [])
      }
    } catch (err) {
      console.error('获取标签失败:', err)
      // 使用模拟标签数据作为后备
      const mockTags: Tag[] = [
        {
          id: '1',
          name: 'Vue.js',
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'React',
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '3',
          name: 'TypeScript',
          created_at: '2024-01-01T00:00:00Z'
        }
      ]
      setTags(mockTags)
    }
  }

  const fetchSkillById = async (id: string): Promise<Skill | null> => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('skills')
        .select('*')
        .eq('id', id)
        .single()

      if (supabaseError) throw supabaseError
      if (!data) return null
      // 映射数据库行到前端 Skill 类型
      const mapped: Skill = {
        id: data.id,
        user_id: data.author_id || data.user_id || '',
        title: data.title || data.name || '未命名技能',
        description: data.description || '',
        content: data.content || '',
        category_id: data.category_id || data.category?.id || '',
        git_url: data.git_url || data.github_url || '',
        install_command: data.install_command || data.install || '',
        featured: !!data.featured,
        recommended: !!data.recommended,
        download_count: typeof data.download_count === 'number' ? data.download_count : (data.downloads ?? 0),
        created_at: data.created_at,
        updated_at: data.updated_at,
        author_name: data.author_name || '',
        tags: Array.isArray(data.tags)
          ? data.tags.map((t: any) => (typeof t === 'string' ? t : (t?.name || '')))
          : []
      }
      return mapped
    } catch (err) {
      console.error('获取技能详情失败:', err)
      return null
    }
  }

  /**
   * 获取技能状态分布统计。
   *
   * 分别统计 `published`、`draft`、`archived` 三种状态的数量，以及 `total` 总数。
   * 若任一查询失败，返回的该项为 0，并在控制台记录错误。
   *
   * 参考官方文档：
   * - Select head+count：https://supabase.com/docs/reference/javascript/select#head
   * - 过滤条件 eq：https://supabase.com/docs/reference/javascript/select#filters
   *
   * @returns {Promise<{ published: number; draft: number; archived: number; total: number }>} 状态统计结果
   */
  const getStatusCounts = async (): Promise<{ published: number; draft: number; archived: number; total: number }> => {
    try {
      const [publishedRes, draftRes, archivedRes, totalRes] = await Promise.all([
        supabase
          .from('skills')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'published'),
        supabase
          .from('skills')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'draft'),
        supabase
          .from('skills')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'archived'),
        supabase.from('skills').select('id', { count: 'exact', head: true }),
      ])

      const published = publishedRes.count ?? 0
      const draft = draftRes.count ?? 0
      const archived = archivedRes.count ?? 0
      const total = totalRes.count ?? 0

      return { published, draft, archived, total }
    } catch (err) {
      console.error('[skillsStore] 获取状态统计失败:', err)
      return { published: 0, draft: 0, archived: 0, total: 0 }
    }
  }

  /**
   * 增加下载次数（非原子，适合作为演示用）。
   * - 读取当前本地 `download_count`，更新到数据库并同步到本地状态。
   * - 若需原子性，建议使用数据库函数（RPC）在服务端递增。
   */
  const incrementDownloadCount = async (skillId: string) => {
    try {
      const current = skills.value.find((s: any) => s.id === skillId)?.download_count ?? 0
      const next = current + 1

      const { error: supabaseError } = await supabase
        .from('skills')
        .update({ download_count: next })
        .eq('id', skillId)

      if (supabaseError) throw supabaseError

      const updatedSkills = skills.value.map((skill: any) =>
        skill.id === skillId ? { ...skill, download_count: next } : skill
      )
      setSkills(updatedSkills as unknown as Skill[])
    } catch (err) {
      console.error('更新下载次数失败:', err)
    }
  }

  return {
    skills,
    categories,
    categoryMap,
    tags,
    loading,
    error,
    searchQuery,
    selectedCategory,
    currentPage,
    itemsPerPage,
    filteredSkills,
    paginatedSkills,
    totalPages,
    setSkills,
    setCategories,
    setTags,
    setLoading,
    setError,
    setSearchQuery,
    setSelectedCategory,
    setCurrentPage,
    fetchSkills,
    fetchLatestSkills,
    fetchFeaturedSkills,
    fetchTotalCount,
    fetchCategories,
    ensureCategoriesLoaded,
    fetchTags,
    fetchSkillById,
    incrementDownloadCount,
    getStatusCounts
  }
})