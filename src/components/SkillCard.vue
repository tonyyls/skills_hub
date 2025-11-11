/**
 * 技能卡片组件
 * 用于展示技能的基本信息和下载功能
 */
<template>
  <div class="glass rounded-2xl overflow-hidden card-hover group min-h-[280px] h-auto flex flex-col">
    <!-- 技能封面 -->
    <div class="h-56 bg-gradient-to-br from-neon-blue/20 via-neon-purple/20 to-neon-pink/20 flex items-center justify-center relative overflow-hidden">
      <!-- 背景装饰 -->
      <div class="absolute inset-0 bg-gradient-to-br from-neon-blue/5 via-transparent to-neon-purple/5"></div>
      <div class="absolute top-4 right-4 w-16 h-16 bg-neon-blue/10 rounded-full blur-2xl animate-pulse"></div>
      <div class="absolute bottom-4 left-4 w-12 h-12 bg-neon-purple/10 rounded-full blur-xl animate-pulse" style="animation-delay: 1s;"></div>
      
      <div class="relative z-10 text-center">
        <component 
          :is="getCategoryIcon(skill.category)" 
          class="w-16 h-16 text-neon-blue mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
        />
        <h3
          class="text-xl font-bold text-white truncate"
          v-truncate-title="skill.title"
        >
          {{ skill.title }}
        </h3>
      </div>
    </div>
    
    <!-- 技能信息 -->
    <div class="p-6 bg-dark-card/80 backdrop-blur-lg">
      <div class="flex items-start justify-between mb-4">
        <span class="bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 text-neon-blue text-xs font-medium px-3 py-1 rounded-full border border-neon-blue/30">
          {{ skill.category }}
        </span>
        <div class="flex items-center space-x-1 text-gray-400 text-sm">
          <Star class="w-4 h-4 text-yellow-400"/>
          <span>{{ skill.rating }}</span>
        </div>
      </div>
      
      <p class="text-gray-300 text-sm mb-4 line-clamp-5 leading-relaxed">{{ skill.description }}</p>
      
      <!-- 标签 -->
      <div class="flex flex-wrap gap-2 mb-4">
        <span
          v-for="tag in (skill.tags || []).slice(0, 3)"
          :key="tag"
          class="bg-white/10 text-gray-300 text-xs px-3 py-1 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-200 cursor-pointer"
        >
          {{ tag }}
        </span>
        <span
          v-if="(skill.tags || []).length > 3"
          class="bg-white/10 text-gray-300 text-xs px-3 py-1 rounded-full border border-white/20"
        >
          +{{ (skill.tags || []).length - 3 }}
        </span>
      </div>
      
      <!-- 作者信息 -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center space-x-3">
          <img
            :src="skill.author?.avatar_url ?? `https://ui-avatars.com/api/?name=${encodeURIComponent((skill.author_name && skill.author_name.trim()) ? skill.author_name : (skill.author?.username ?? '官方'))}&background=cccccc&color=ffffff`"
            :alt="(skill.author_name && skill.author_name.trim()) ? skill.author_name : (skill.author?.username ?? '官方')"
            class="w-8 h-8 rounded-full border-2 border-neon-blue/30"
          />
          <div>
            <span class="text-sm text-gray-300 font-medium">{{ (skill.author_name && skill.author_name.trim()) ? skill.author_name : (skill.author?.username ?? '官方') }}</span>
            <div class="text-xs text-gray-500">{{ formatDate((skill.created_at ?? skill.createdAt) ?? new Date().toISOString()) }}</div>
          </div>
        </div>
        <div class="flex items-center space-x-1 text-gray-400 text-sm">
          <Download class="w-4 h-4"/>
          <span>{{ skill.download_count ?? (skill.downloads ?? 0) }}</span>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="flex space-x-3">
        <button
          @click="handleDownload"
          class="flex-1 bg-gradient-to-r from-neon-blue to-neon-purple text-white py-3 px-4 rounded-xl hover:shadow-neon transition-all duration-300 text-sm font-semibold group"
        >
          <Download class="inline-block w-4 h-4 mr-2 group-hover:animate-bounce"/>
          下载资源
        </button>
        <router-link
          :to="`/skills/${skill.id}`"
          class="px-4 py-3 border border-white/20 rounded-xl hover:bg-white/10 hover:border-white/30 transition-all duration-300 text-sm font-semibold text-gray-300 group"
        >
          <span class="group-hover:text-neon-blue transition-colors duration-300">查看详情</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Download, Star } from 'lucide-vue-next'
import { type Skill } from '@/lib/supabase'

interface Props {
  skill: Skill
}

const props = defineProps<Props>()
const emit = defineEmits<{
  download: [skillId: string]
}>()

/**
 * 获取分类图标（简化版本）
 */
const getCategoryIcon = (category: string) => {
  // 这里可以根据实际需求返回不同的图标组件
  // 为了简化，我们返回一个默认的图标
  return 'div'
}

/**
 * 格式化日期
 */
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * 处理下载
 */
const handleDownload = () => {
  emit('download', props.skill.id)
}
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 多行省略：限制为 5 行 */
.line-clamp-5 {
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>