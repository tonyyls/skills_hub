import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Skill, Category, Tag } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

export const useSkillsStore = defineStore('skills', () => {
  const skills = ref<Skill[]>([])
  const categories = ref<Category[]>([])
  const tags = ref<Tag[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const selectedCategory = ref<string>('')
  const currentPage = ref(1)
  const itemsPerPage = ref(12)

  const filteredSkills = computed(() => {
    let result = skills.value

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(skill =>
        skill.title.toLowerCase().includes(query) ||
        skill.description.toLowerCase().includes(query) ||
        skill.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    if (selectedCategory.value) {
      result = result.filter(skill => skill.category === selectedCategory.value)
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
            tags: ['Vue.js', '前端开发', 'TypeScript']
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
            tags: ['React', '前端开发', 'JavaScript']
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
            tags: ['Figma', 'UI设计', '设计系统']
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
            tags: ['Python', '数据分析', '机器学习']
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
            tags: ['产品管理', '需求分析', '项目管理']
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
            tags: ['TypeScript', '前端开发', 'JavaScript']
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
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          },
          {
            id: '2',
            name: 'UI设计',
            description: 'Figma, Sketch, Adobe XD等设计工具和理论',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          },
          {
            id: '3',
            name: '数据分析',
            description: 'Python, R, SQL, Excel等数据分析工具',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          },
          {
            id: '4',
            name: '产品管理',
            description: '产品规划、需求分析、项目管理等产品技能',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          },
          {
            id: '5',
            name: '移动开发',
            description: 'iOS, Android, React Native, Flutter等移动开发技术',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          },
          {
            id: '6',
            name: '云计算',
            description: 'AWS, Azure, Google Cloud等云服务平台',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
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
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'UI设计',
          description: 'Figma, Sketch, Adobe XD等设计工具和理论',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '3',
          name: '数据分析',
          description: 'Python, R, SQL, Excel等数据分析工具',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]
      setCategories(mockCategories)
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
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          },
          {
            id: '2',
            name: 'React',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          },
          {
            id: '3',
            name: 'TypeScript',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          },
          {
            id: '4',
            name: 'Figma',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          },
          {
            id: '5',
            name: 'Python',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          },
          {
            id: '6',
            name: '产品管理',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
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
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'React',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '3',
          name: 'TypeScript',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
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

  const incrementDownloadCount = async (skillId: string) => {
    try {
      const { error: supabaseError } = await supabase
        .from('skills')
        .update({ downloads: supabase.raw('downloads + 1') })
        .eq('id', skillId)

      if (supabaseError) throw supabaseError

      const updatedSkills = skills.value.map(skill =>
        skill.id === skillId ? { ...skill, downloads: skill.downloads + 1 } : skill
      )
      setSkills(updatedSkills)
    } catch (err) {
      console.error('更新下载次数失败:', err)
    }
  }

  return {
    skills,
    categories,
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
    fetchCategories,
    fetchTags,
    fetchSkillById,
    incrementDownloadCount
  }
})