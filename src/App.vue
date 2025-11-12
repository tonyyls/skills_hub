<template>
  <div id="app">
    <!-- 导航栏 -->
    <NavBar />
    
    <!-- 主要内容 -->
    <main>
      <router-view />
    </main>
    
    <!-- 页脚（统一橙白主题） -->
    <footer class="bg-white text-[#333] py-6 mt-12 border-t border-[#E5E5E5]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- 单行双端对齐：左简介，右版权，与顶部栅格对齐 -->
        <div class="flex items-center justify-between gap-6">
          <!-- 左侧：Skills Hub 简介 -->
          <div class="inline-flex items-center gap-3">
            <span class="text-lg font-semibold text-[#333]">Skills Hub</span>
            <span class="text-[#999]">·</span>
            <span class="text-[#666] text-sm">汇聚全网最优秀的Skills资源</span>
          </div>

          <!-- 右侧：版权信息 -->
          <p class="text-sm text-[#666]">© 2025 Skills Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import NavBar from '@/components/NavBar.vue'

// 友情链接类型声明（与后端 link_exchange 表结构对应的必要字段）
interface FriendLink {
  id: string
  name: string
  url: string
  description?: string
  sort_order: number
  enabled: boolean
}

// 友情链接数据（公开接口）
const friendLinks = ref<FriendLink[]>([])

/**
 * 加载友情链接：从公开接口 `/api/links` 读取启用项。
 * - 服务端已按排序返回（sort_order ASC, created_at DESC）
 * - 若返回空列表，页脚第三列显示“用户中心”作为回退内容
 * @returns {Promise<void>} 无返回
 */
const loadFriendLinks = async (): Promise<void> => {
  try {
    const res = await fetch('/api/links', { headers: { 'Accept': 'application/json' } })
    if (!res.ok) return
    const data = await res.json().catch(() => ({ items: [] }))
    friendLinks.value = Array.isArray(data.items) ? data.items : []
  } catch {
    friendLinks.value = []
  }
}

onMounted(async () => {
  await loadFriendLinks()
})
</script>

<style>
/* 全局样式 */
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式图片 */
img {
  max-width: 100%;
  height: auto;
}

/* 链接样式 */
a {
  color: inherit;
  text-decoration: none;
}

/* 按钮聚焦样式 */
button:focus,
input:focus,
select:focus,
textarea:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}
</style>