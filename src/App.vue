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
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 class="text-lg font-semibold mb-4 text-[#333]">Skills Hub</h3>
            <p class="text-[#666] text-sm">
              技能分享平台，连接技能拥有者和学习者
            </p>
          </div>
          <div>
            <h4 class="text-md font-medium mb-4 text-[#333]">快速链接</h4>
            <ul class="space-y-2 text-sm">
              <li><router-link to="/" class="text-[#666] hover:text-[#FF7A45]">首页</router-link></li>
              <li><router-link to="/skills" class="text-[#666] hover:text-[#FF7A45]">技能资源</router-link></li>
              <li><router-link to="/tutorial" class="text-[#666] hover:text-[#FF7A45]">使用教程</router-link></li>
              <li><router-link to="/about" class="text-[#666] hover:text-[#FF7A45]">关于我们</router-link></li>
            </ul>
          </div>
          <div>
            <h4 class="text-md font-medium mb-4 text-[#333]">用户中心</h4>
            <ul class="space-y-2 text-sm">
              <li><router-link to="/profile" class="text-[#666] hover:text-[#FF7A45]">个人资料</router-link></li>
              <!-- 发布技能入口关闭，仅管理员后台发布 -->
              <li><router-link to="/admin" class="text-[#666] hover:text-[#FF7A45]">管理后台</router-link></li>
            </ul>
          </div>
          <div>
            <h4 class="text-md font-medium mb-4 text-[#333]">联系我们</h4>
            <ul class="space-y-2 text-sm text-[#666]">
              <li>feedback@skillshub.com</li>
              <li>github.com/skillshub</li>
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
import NavBar from '@/components/NavBar.vue'
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