<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-6">
      <h1 class="text-2xl font-semibold">文档技能</h1>
      <p class="text-sm text-gray-500">自动将文档站、GitHub、PDF 转为可上传的 Claude 技能包</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      <div class="rounded-xl border bg-white shadow-sm p-4">
        <h2 class="font-medium">文档抓取</h2>
        <p class="text-sm text-gray-600">llms.txt、通用爬取、智能分类</p>
      </div>
      <div class="rounded-xl border bg-white shadow-sm p-4">
        <h2 class="font-medium">GitHub 深度解析</h2>
        <p class="text-sm text-gray-600">AST、API、Issues/PR/Releases、冲突检测</p>
      </div>
      <div class="rounded-xl border bg-white shadow-sm p-4">
        <h2 class="font-medium">PDF 提取</h2>
        <p class="text-sm text-gray-600">OCR、表格解析、并行加速</p>
      </div>
      <div class="rounded-xl border bg-white shadow-sm p-4">
        <h2 class="font-medium">多源合并</h2>
        <p class="text-sm text-gray-600">统一技能包与差异报告</p>
      </div>
      <div class="rounded-xl border bg-white shadow-sm p-4">
        <h2 class="font-medium">AI 增强</h2>
        <p class="text-sm text-gray-600">本地增强示例与关键概念</p>
      </div>
    </div>

    <div class="mb-6">
      <RouterLink class="px-4 py-2 bg-gradient-to-r from-[#FF6A3A] to-[#FF7A45] text-white rounded-lg hover:opacity-90 transition" to="/doc-skills/create">创建技能</RouterLink>
    </div>

    <div v-if="tasks.length === 0" class="rounded-xl border bg-white shadow-sm p-8 text-center text-gray-600">
      尚未创建技能任务，点击上方按钮开始
    </div>
    <ul v-else class="space-y-3">
      <li v-for="t in tasks" :key="t.id" class="rounded-xl border bg-white shadow-sm p-4 flex items-center justify-between">
        <div>
          <div class="font-medium">任务 {{ t.id }}</div>
          <div class="text-sm text-gray-500">状态 {{ t.status }}｜进度 {{ t.progress }}%</div>
        </div>
        <RouterLink class="px-3 py-2 border rounded-lg text-[#333] hover:text-[#FF7A45] hover:bg-[#FFF5EF] transition" :to="`/doc-skills/tasks/${t.id}`">查看详情</RouterLink>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useDocSkillsStore } from '@/stores/docSkills'
const store = useDocSkillsStore()
const tasks = ref<any[]>([])
onMounted(async () => {
  const r = await store.listMine({ page: '1', pageSize: '20' })
  tasks.value = r.items || []
})
</script>