<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-2xl font-semibold mb-4">任务详情</h1>
    <div class="rounded-xl border bg-white shadow-sm p-4 space-y-3" v-if="task">
      <div>状态：<span class="inline-block px-2 py-1 rounded bg-[#FFF5EF] text-[#FF7A45]">{{ task.status }}</span></div>
      <div class="w-full bg-gray-100 h-2 rounded">
        <div class="bg-gradient-to-r from-[#FF6A3A] to-[#FF7A45] h-2 rounded" :style="{ width: `${task.progress || 0}%` }"></div>
      </div>
      <pre class="bg-gray-50 p-3 rounded max-h-72 overflow-auto text-sm text-gray-700">{{ task.logs }}</pre>
      <div v-if="task.resultUrl"><a class="px-3 py-2 border rounded-lg text-[#333] hover:text-[#FF7A45] hover:bg-[#FFF5EF] transition" :href="task.resultUrl" target="_blank">下载技能包</a></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useDocSkillsStore } from '@/stores/docSkills'
const route = useRoute()
const store = useDocSkillsStore()
const task = ref<any>(null)
onMounted(async () => {
  const r = await store.fetchTask(route.params.id as string)
  task.value = r
})
</script>