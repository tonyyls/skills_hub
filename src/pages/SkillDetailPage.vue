/**
 * 技能详情页面
 * 展示技能详细信息、下载功能和相关推荐
 */
<template>
  <div class="min-h-screen bg-white">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">加载中...</p>
      </div>
    </div>
    
    <!-- 错误状态（整站橙色主题统一） -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <AlertCircle class="w-16 h-16 text-[#FF7A45] mx-auto mb-4" />
        <h2 class="text-xl font-semibold text-gray-900 mb-2">加载失败</h2>
        <p class="text-gray-600 mb-2">{{ error }}</p>
      </div>
    </div>
    
    <!-- 技能详情 -->
    <div v-else-if="skill" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 返回按钮 -->
      <div class="mb-6">
        <a
          href="#"
          @click.prevent="goBack"
          class="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>返回技能列表</span>
        </a>
      </div>
      
      <!-- 主要内容 -->
      <div class="bg-white rounded-2xl shadow-sm border border-[#EEEEEE] overflow-hidden">
        <!-- 头部信息 -->
        <div class="p-6 lg:p-8 border-b border-gray-200">
          <!-- 标题在上、描述在下；标签/精选/推荐/作者重新排序 -->
          <div class="space-y-4 mb-6">
            <h1 class="text-2xl lg:text-3xl font-semibold tracking-tight text-gray-900">{{ skill.title }}</h1>
            <p class="text-gray-700 text-sm lg:text-base leading-7">{{ skill.description }}</p>
            <!-- Git 地址卡片：置于标题与描述之后、标签之前 -->
            <div v-if="skill.git_url" class="mt-2 bg-gray-50 rounded-lg p-3 group">
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-2 min-w-0">
                  <Github class="w-4 h-4 text-gray-700 flex-shrink-0" />
                  <span
                    class="text-gray-600 break-all truncate"
                    :title="skill.git_url"
                  >
                    {{ skill.git_url }}
                  </span>
                </div>
                <a
                  href="#"
                  class="inline-flex items-center justify-center w-8 h-8 rounded-md text-gray-600 hover:text-gray-900 transition-opacity opacity-0 group-hover:opacity-100"
                  @click.prevent="copyToClipboard(skill.git_url)"
                  aria-label="复制Git地址"
                >
                  <Copy class="w-4 h-4" />
                </a>
              </div>
            </div>
            <!-- 行1：标签在最前（去除多余 div，统一为 p/span 样式） -->
            <div class="flex flex-wrap items-center gap-4">
              <p class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                {{ skill.category?.name || getCategoryName(skill.category_id) || '未分类' }}
              </p>
              <p v-if="skill.featured" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                精选
              </p>
              <p v-if="skill.recommended" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                推荐
              </p>
            <p class="text-xs text-gray-600">{{ (skill.author_name && skill.author_name.trim()) ? skill.author_name : (skill.author?.username || '官方') }}</p>
              <p class="text-sm text-gray-500">最新更新于 {{ formatDate(skill?.updated_at || skill?.updatedAt || skill?.created_at) }}</p>
            </div>
            <!-- 技能标签显示 -->
            <div v-if="skill.tags && skill.tags.length" class="mt-4">
              <div class="flex flex-wrap gap-2">
                <span v-for="tag in skill.tags" :key="typeof tag==='string'?tag:tag?.name" class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  {{ typeof tag==='string'?tag:(tag?.name||'') }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 顶部标签导航（静态） -->
        <div class="px-6 lg:px-8 mt-4 flex items-center gap-6">
          <span class="relative pb-3 text-[#E07245]">
            概述
            <span class="absolute left-0 -bottom-px w-full h-0.5 bg-[#E07245]"></span>
          </span>
          <span class="pb-3 text-gray-600 hover:text-gray-900 transition">评论</span>
        </div>
        
        <!-- 主体：概述单列铺满 -->
        <div class="p-6 lg:p-8">
          <div class="grid grid-cols-1 gap-6">
            <!-- 概述内容：直接放在概述下方，无卡片容器 -->
            <div>
              <div class="mt-4 space-y-6">
                  <div>
                    <h3 class="font-semibold text-gray-900 mb-2">是什么？</h3>
                    <p class="text-gray-700 leading-relaxed">{{ skill.content || skill.description || '暂无描述。' }}</p>
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 mb-2">如何使用？</h3>
                    <p v-if="skill.install_command" class="text-gray-700 leading-relaxed">通过下方的安装命令快速开始，或访问源码仓库获取更多示例。</p>
                    <p v-else class="text-gray-500">暂无安装说明。</p>
                  </div>

                  <!-- 安装命令：移动到“如何使用？”下方，始终完整展示 -->
                  <div v-if="skill.install_command" class="relative group mt-3">
                    <h3 class="font-semibold text-gray-900 mb-2">安装命令</h3>
                    <pre
                      class="relative bg-gray-50 rounded-md px-3 pt-4 pb-3 pr-10 text-gray-800 whitespace-pre-wrap break-all font-mono text-sm"
                    >
<code>{{ skill.install_command }}</code>
                      <a
                        href="#"
                        class="absolute top-3 right-3 inline-flex items-center justify-center w-8 h-8 rounded-md text-gray-600 hover:text-gray-900 transition-opacity opacity-0 group-hover:opacity-100"
                        @click.prevent="copyToClipboard(skill.install_command)"
                        aria-label="复制安装命令"
                      >
                        <Copy class="w-4 h-4" />
                      </a>
                    </pre>
                  </div>

              </div>
              <!-- 元信息：已移除 -->
            </div>
          </div>
        </div>
      </div>

      <!-- 相关推荐 -->
      <div v-if="relatedSkills.length > 0" class="mt-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-8">相关推荐</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <SkillCard
            v-for="relatedSkill in relatedSkills"
            :key="relatedSkill.id"
            :skill="relatedSkill"
            @download="handleRelatedDownload"
          />
        </div>
      </div>

      <!-- Toast 提示：固定定位，自动消失 -->
      <div
        v-if="toastVisible"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
        role="status"
        aria-live="polite"
      >
        <span class="text-sm">{{ toastMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Star, AlertCircle, Github, Copy } from 'lucide-vue-next'
import { useSkillsStore } from '@/stores/skills'
import { supabase, type Skill } from '@/lib/supabase'
import SkillCard from '@/components/SkillCard.vue'

const route = useRoute()
const router = useRouter()
const skillsStore = useSkillsStore()

/**
 * 根据分类ID获取分类中文名称。
 * 优先使用已加载的分类列表；未找到时返回空字符串，
 * 由模板层统一回退为“未分类”。
 * @param {string} categoryId 分类主键ID
 * @returns {string} 分类名称或空字符串
 */
const getCategoryName = (categoryId: string): string => {
  if (!categoryId) return ''
  const category = skillsStore.categories.find(c => c.id === categoryId)
  return category?.name || ''
}

// 状态管理
const skill = ref<Skill | null>(null)
const isLoading = ref(false)
const error = ref('')
const isDownloading = ref(false)
const relatedSkills = ref<Skill[]>([])

// 安装命令始终完整展示，移除折叠/展开逻辑

// Toast 状态与展示
/**
 * 轻量 Toast 通知状态。
 * - `toastMessage` 当前提示文案
 * - `toastVisible` 控制显示/隐藏
 * - `showToast` 展示指定文案并在指定毫秒后自动隐藏
 * @param {string} message 提示文案
 * @param {number} duration 自动消失时长（毫秒），默认 2000ms
 */
const toastMessage = ref('')
const toastVisible = ref(false)
const showToast = (message: string, duration = 2000) => {
  toastMessage.value = message
  toastVisible.value = true
  window.setTimeout(() => {
    toastVisible.value = false
    toastMessage.value = ''
  }, duration)
}

/**
 * 加载技能详情
 */
const loadSkill = async () => {
  const skillId = route.params.id as string
  if (!skillId) {
    error.value = '无效的技能ID'
    return
  }
  
  isLoading.value = true
  error.value = ''
  
  try {
    // 获取技能详情
    const skillData = await skillsStore.fetchSkillById(skillId)
    if (skillData) {
      skill.value = skillData
      
      // 加载相关推荐
      await loadRelatedSkills(skillData)
    } else {
      error.value = '技能不存在或已删除'
    }
  } catch (err) {
    error.value = '加载失败，请稍后重试'
    console.error('Load skill error:', err)
  } finally {
    isLoading.value = false
  }
}

/**
 * 加载相关推荐
 */
const loadRelatedSkills = async (currentSkill: Skill) => {
  try {
    const { data, error } = await supabase
      .from('skills')
      .select(`
        *,
        author:user_id (
          id,
          name,
          avatar
        )
      `)
      .neq('id', currentSkill.id)
      .or(`category.eq.${currentSkill.category},tags.cs.{${currentSkill.tags.join(',')}}`)
      .limit(3)
    
    if (!error && data) {
      relatedSkills.value = data.map(item => ({
        ...item,
        author: Array.isArray(item.author) ? item.author[0] : item.author
      }))
    }
  } catch (err) {
    console.error('Load related skills error:', err)
  }
}

/**
 * 处理下载
 */
const handleDownload = async () => {
  if (!skill.value || isDownloading.value) return
  
  isDownloading.value = true
  
  try {
    // 模拟下载过程
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 增加下载次数
    await skillsStore.incrementDownloadCount(skill.value.id)
    
    // 创建下载链接
    const link = document.createElement('a')
    link.href = skill.value.fileUrl || '#'
    link.download = `${skill.value.title}.zip`
    link.click()
    
    // 显示成功消息
    alert('下载成功！')
  } catch (err) {
    console.error('Download error:', err)
    alert('下载失败，请稍后重试')
  } finally {
    isDownloading.value = false
  }
}

/**
 * 处理相关技能下载
 */
const handleRelatedDownload = (skillId: string) => {
  router.push(`/skills/${skillId}`)
}

/**
 * 返回上一页
 */
const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/skills')
  }
}

/**
 * 格式化日期时间为 `YYYY/MM/DD HH:mm`。
 * - 优先用于“最新更新于”展示，若无更新时间则回退到创建时间。
 * - 使用原生 `Intl.DateTimeFormat` 保持可控格式与跨浏览器一致性。
 * @param {string} date ISO 风格时间字符串
 * @returns {string} 形如 `2025/11/11 12:00` 的字符串
 */
const formatDate = (date: string): string => {
  if (!date) return ''
  const d = new Date(date)
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)
  const y = d.getFullYear()
  const m = pad(d.getMonth() + 1)
  const day = pad(d.getDate())
  const hh = pad(d.getHours())
  const mm = pad(d.getMinutes())
  return `${y}/${m}/${day} ${hh}:${mm}`
}

onMounted(() => {
  loadSkill()
})

/**
 * 复制文本到剪贴板。
 * - 使用 `navigator.clipboard.writeText` 优先实现；
 * - 回退到创建临时输入节点的方式以兼容旧浏览器；
 * @param {string} text 待复制文本
 * @returns {Promise<void>} 复制成功或失败后的提示
 */
const copyToClipboard = async (text: string): Promise<void> => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      const input = document.createElement('textarea')
      input.value = text
      input.style.position = 'fixed'
      input.style.left = '-9999px'
      document.body.appendChild(input)
      input.focus()
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
    showToast('已复制到剪贴板')
  } catch (e) {
    console.error('复制失败：', e)
    showToast('复制失败，请手动复制')
  }
}
</script>