<template>
  <div id="app">
    <!-- 导航栏 -->
    <NavBar />
    
    <!-- 主要内容 -->
    <main>
      <router-view />
    </main>
    
    <!-- 页脚（统一橙白主题） -->
    <footer class="bg-white text-[#333] py-8 mt-12 border-t border-[#E5E5E5]">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10 justify-items-center items-start text-center">
          <div>
            <h3 class="text-lg font-semibold mb-3 text-[#333]">Skills Hub</h3>
            <p class="text-[#666] text-sm leading-relaxed">
              汇聚全网最优秀的Skills资源
            </p>
          </div>
          
          <!-- 第二列：在此位置显示友情链接（有数据时），无数据时显示用户中心 -->
          <div v-if="friendLinks.length > 0">
            <h4 class="text-lg font-semibold mb-3 text-[#333]">友情链接</h4>
            <ul class="space-y-2 text-sm leading-relaxed">
              <li v-for="link in friendLinks" :key="link.id">
                <a
                  :href="link.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-[#666] hover:text-[#FF7A45] transition-colors"
                >
                  {{ link.name }}
                </a>
              </li>
            </ul>
          </div>
          <!-- 无数据时回退显示用户中心，避免布局空列 -->
          <div v-else>
            <h4 class="text-lg font-semibold mb-3 text-[#333]">用户中心</h4>
            <ul class="space-y-2 text-sm leading-relaxed">
              <li>
                <router-link to="/profile" class="text-[#666] hover:text-[#FF7A45] transition-colors">个人资料</router-link>
              </li>
              <li>
                <router-link to="/admin" class="text-[#666] hover:text-[#FF7A45] transition-colors">管理后台</router-link>
              </li>
            </ul>
          </div>
          
        </div>
        <div class="border-t border-[#E5E5E5] mt-8 pt-8 text-center text-sm text-[#666]">
          <p>&copy; 2025 Skills Hub. All rights reserved.</p>
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