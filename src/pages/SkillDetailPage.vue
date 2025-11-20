/**
 * 技能详情页面
 * 展示技能详细信息、下载功能和相关推荐
 */
<template>
  <div class="min-h-screen bg-[#F7F3EF]">
    <div v-if="isLoading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-2xl shadow-sm border border-[#EEEEEE] overflow-hidden">
        <div class="p-6 lg:p-8 border-b border-gray-200 animate-pulse">
          <div class="h-7 bg-gray-200 rounded w-2/3 mb-4"></div>
          <div class="space-y-2">
            <div class="h-4 bg-gray-200 rounded w-full"></div>
            <div class="h-4 bg-gray-200 rounded w-11/12"></div>
            <div class="h-4 bg-gray-200 rounded w-10/12"></div>
          </div>
          <div class="mt-4 flex items-center gap-4">
            <div class="h-5 bg-gray-200 rounded w-24"></div>
            <div class="h-5 bg-gray-200 rounded w-16"></div>
            <div class="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
        <div class="px-6 lg:px-8 pt-6 pb-8 animate-pulse">
          <div class="h-5 bg-gray-200 rounded w-24 mb-3"></div>
          <div class="space-y-3">
            <div class="h-4 bg-gray-200 rounded w-full"></div>
            <div class="h-4 bg-gray-200 rounded w-11/12"></div>
            <div class="h-4 bg-gray-200 rounded w-10/12"></div>
            <div class="h-4 bg-gray-200 rounded w-9/12"></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 错误状态（整站橙色主题统一） -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <AlertCircle class="w-16 h-16 text-[#FF7A45] mx-auto mb-4" />
        <h2 class="text-xl font-semibold text-gray-900 mb-2">{{ t('pages.skillDetail.loadFailedTitle') }}</h2>
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
          <span>{{ t('pages.skills.title') }}</span>
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
            <!-- 行1：标签在最前（去除多余 div，统一为 p/span 样式） -->
            <div class="flex flex-wrap items-center gap-4">
              <p class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                {{ skill.category?.name || getCategoryName(skill.category_id) || '未分类' }}
              </p>
              <p v-if="skill.featured" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                {{ t('pages.skills.featured') }}
              </p>
              <p v-if="skill.recommended" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                推荐
              </p>
            <p class="text-xs text-gray-600">{{ (skill.author_name && skill.author_name.trim()) ? skill.author_name : (skill.author?.username || '官方') }}</p>
            <p class="text-sm text-gray-500">{{ t('pages.skillDetail.meta.updatedAt') }} {{ formatDate(skill?.updated_at || skill?.updatedAt || skill?.created_at) }}</p>
            </div>
            <!-- 技能标签显示 与 反馈按钮 -->
            <div v-if="skill.tags && skill.tags.length" class="mt-4">
              <div class="flex flex-wrap gap-2">
                <span v-for="tag in skill.tags" :key="typeof tag==='string'?tag:tag?.name" class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gradient-to-r from-[#FF7A45] to-[#E07245] text-white shadow-sm ring-1 ring-white/10">
                  {{ typeof tag==='string'?tag:(tag?.name||'') }}
                </span>
              </div>
            </div>
            
            
            <div v-if="skill.git_url" class="relative group mt-3">
              <h3 class="font-semibold text-gray-900 mb-2">{{ t('pages.skillDetail.git') }}</h3>
              <pre
                class="relative bg-gray-50 rounded-md px-3 py-4 pr-10 text-gray-800 whitespace-pre-wrap break-words font-mono text-sm overflow-x-auto min-h-14 flex items-center"
              >
<code class="w-full leading-relaxed">{{ skill.git_url }}</code>
                <a
                  href="#"
                  class="absolute top-3 right-3 inline-flex items-center justify-center w-8 h-8 rounded-md text-gray-600 hover:text-gray-900 transition-opacity opacity-0 group-hover:opacity-100"
                  @click.prevent="copyToClipboard(skill.git_url)"
                  aria-label="复制Git地址"
                >
                  <Copy class="w-4 h-4" />
                </a>
              </pre>
            </div>
            <div v-if="skill.install_command" class="relative group mt-3">
              <h3 class="font-semibold text-gray-900 mb-2">{{ t('pages.skillDetail.install') }}</h3>
              <pre
                class="relative bg-gray-50 rounded-md px-3 py-4 pr-10 text-gray-800 whitespace-pre-wrap break-words font-mono text-sm overflow-x-auto min-h-14 flex items-center"
              >
<code class="w-full leading-relaxed">{{ skill.install_command }}</code>
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
        </div>
        
        <!-- 顶部标签导航（静态） -->
        <div class="px-6 lg:px-8 mt-4 flex items-center gap-6">
          <span class="relative pb-1 text-[#E07245]">
            {{ t('pages.skillDetail.overview') }}
            <span class="absolute left-0 -bottom-px w-full h-0.5 bg-[#E07245]"></span>
          </span>
        </div>
        
        <!-- 主体：概述单列铺满 -->
        <div class="px-6 lg:px-8 pt-2 pb-6 lg:pb-8">
          <div class="grid grid-cols-1 gap-4">
            <!-- 概述内容：直接放在概述下方，无卡片容器 -->
            <div>
              <div class="mt-2 space-y-4">
                  <div>
                    <div class="markdown-body" v-if="(skill?.content || skill?.description)">
                      <div v-html="mdHtml"></div>
                    </div>
                    <p v-else class="text-gray-500">{{ t('pages.skillDetail.noDescription') }}</p>
                  </div>
                  <div>
                    
                  </div>

              </div>
              <!-- 元信息：已移除 -->
            </div>
          </div>
        </div>
      </div>

      <!-- 相关推荐 -->
      <div v-if="relatedSkills.length > 0" class="mt-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-8">{{ t('pages.skillDetail.related') }}</h2>
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
      <button v-if="enableFeedback" type="button" @click="openFeedback" class="fixed bottom-6 right-6 z-50 inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-[#FF7A45] to-[#E07245] text-white shadow-lg hover:shadow-2xl focus:outline-none transition-transform hover:scale-105 hover:ring-2 hover:ring-white/40 group" aria-label="反馈">
        <MessageSquare class="w-6 h-6 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6" />
      </button>
    </div>

    <!-- 反馈弹窗 -->
    <div v-if="enableFeedback && showFeedbackModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/30" @click="showFeedbackModal=false"></div>
      <div class="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
        <h3 class="text-base font-semibold text-gray-900 mb-4">{{ t('pages.skillDetail.feedback.title') }}</h3>
        <div class="space-y-3">
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" :value="t('pages.skillDetail.feedback.issueCatIncorrect')" v-model="selectedIssues" class="rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
            <span>{{ t('pages.skillDetail.feedback.issueCatIncorrect') }}</span>
          </label>
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" :value="t('pages.skillDetail.feedback.issueInstallFailed')" v-model="selectedIssues" class="rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
            <span>{{ t('pages.skillDetail.feedback.issueInstallFailed') }}</span>
          </label>
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" :value="t('pages.skillDetail.feedback.issueUrlUnavailable')" v-model="selectedIssues" class="rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
            <span>{{ t('pages.skillDetail.feedback.issueUrlUnavailable') }}</span>
          </label>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('pages.skillDetail.feedback.otherLabel') }}</label>
            <textarea v-model="otherComment" maxlength="100" rows="3" class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors" :placeholder="t('pages.skillDetail.feedback.otherPlaceholder')"></textarea>
            <div class="mt-1 text-xs text-gray-500">{{ otherComment.length }}/100</div>
          </div>
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <button type="button" class="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50" @click="showFeedbackModal=false" :disabled="isSubmitting">{{ t('pages.skillDetail.feedback.cancel') }}</button>
          <button type="button" class="px-3 py-1.5 text-sm border border-orange-600 text-orange-600 rounded-md hover:bg-orange-50 disabled:opacity-50" @click="submitFeedback" :disabled="isSubmitting">{{ isSubmitting ? t('pages.skillDetail.feedback.submitting') : t('pages.skillDetail.feedback.submit') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Star, AlertCircle, Github, Copy, MessageSquare } from 'lucide-vue-next'
import { useSkillsStore } from '@/stores/skills'
import { supabase, type Skill } from '@/lib/supabase'
import SkillCard from '@/components/SkillCard.vue'
import { renderMarkdown } from '@/utils/markdown'
import { useI18n } from 'vue-i18n'

const enableFeedback = import.meta.env.VITE_ENABLE_FEEDBACK !== 'false'

const route = useRoute()
const router = useRouter()
const skillsStore = useSkillsStore()
const { t } = useI18n()

/**
 * 根据分类ID获取分类中文名称。
 * 优先使用已加载的分类列表；未找到时返回空字符串，
 * 由模板层统一回退为“未分类”。
 * @param {string} categoryId 分类主键ID
 * @returns {string} 分类名称或空字符串
 */
const getCategoryName = (categoryId: string): string => {
  if (!categoryId) return ''
  return (skillsStore as any).categoryMap?.[categoryId] || ''
}

// 状态管理
const skill = ref<Skill | null>(null)
const isLoading = ref(false)
const error = ref('')
const isDownloading = ref(false)
const relatedSkills = ref<Skill[]>([])

const mdHtml = computed<string>(() => {
  const src = skill.value?.content || skill.value?.description || ''
  return renderMarkdown(src)
})

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
    error.value = t('pages.skillDetail.invalidId')
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
      error.value = t('pages.skillDetail.notFound')
    }
  } catch (err) {
    error.value = t('pages.skillDetail.loadFailed')
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
 * - 优先用于“最近更新于”展示，若无更新时间则回退到创建时间。
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

onMounted(async () => {
  try { await (skillsStore as any).ensureCategoriesLoaded?.() } catch {}
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
    showToast(t('pages.skillDetail.copySuccess'))
  } catch (e) {
    console.error('复制失败：', e)
    showToast(t('pages.skillDetail.copyFailed'))
  }
}

const showFeedbackModal = ref(false)
const isSubmitting = ref(false)
const selectedIssues = ref<string[]>([])
const otherComment = ref('')

/**
 * 打开反馈弹窗。
 * 允许以下身份发起反馈：
 * - 普通用户：存在 Supabase 会话
 * - 管理员：本地存在 `admin_token`
 */
const openFeedback = async (): Promise<void> => {
  const { data } = await supabase.auth.getSession()
  const adminToken = localStorage.getItem('admin_token')
  if (!(data?.session || adminToken)) {
    showToast(t('pages.skillDetail.feedback.loginRequired'))
    return
  }
  showFeedbackModal.value = true
}

/**
 * 提交反馈。
 * 令牌选择优先级：Supabase 用户令牌 > 管理员令牌。
 */
const submitFeedback = async (): Promise<void> => {
  const { data } = await supabase.auth.getSession()
  const adminToken = localStorage.getItem('admin_token')
  if (!(data?.session || adminToken)) {
    showToast(t('pages.skillDetail.feedback.loginRequired'))
    return
  }
  if (selectedIssues.value.length === 0 && !otherComment.value.trim()) {
    showToast(t('pages.skillDetail.feedback.selectIssueRequired'))
    return
  }
  if (!skill.value?.id) return
  isSubmitting.value = true
  try {
    const token = data?.session?.access_token || adminToken || ''
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ type: 'skill', source_id: skill.value.id, issues: selectedIssues.value, comment: otherComment.value.trim() })
    })
    if (!res.ok) throw new Error('submit_failed')
    showFeedbackModal.value = false
    selectedIssues.value = []
    otherComment.value = ''
    showToast(t('pages.skillDetail.feedback.submitSuccess'))
  } catch {
    showToast(t('pages.skillDetail.feedback.submitError'))
  } finally {
    isSubmitting.value = false
  }
}
</script>
