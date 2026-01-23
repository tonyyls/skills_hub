import { defineStore } from 'pinia'

export type SourceType = 'docs' | 'github' | 'pdf'

export interface CreateTaskPayload {
  sourceType: SourceType
  sourceConfig: Record<string, any>
  options?: Record<string, any>
  output?: Record<string, any>
}

export interface TaskItem {
  id: string
  status: 'pending' | 'running' | 'succeeded' | 'failed' | 'canceled'
  progress: number
  resultUrl?: string
  logs?: string
  createdAt?: string
}

export const useDocSkillsStore = defineStore('docSkills', {
  state: () => ({ list: [] as TaskItem[], byId: {} as Record<string, TaskItem> }),
  actions: {
    async listMine(params: Record<string, string>) {
      const r = await fetch(`/api/doc-skills/tasks?${new URLSearchParams({ createdBy: 'me', ...params })}`)
      const json = await r.json()
      this.list = json.items || []
      return json
    },
    async createTask(payload: CreateTaskPayload) {
      const r = await fetch('/api/doc-skills/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const json = await r.json()
      return json.taskId as string
    },
    async fetchTask(id: string) {
      const r = await fetch(`/api/doc-skills/tasks/${id}`)
      const json = await r.json()
      this.byId[id] = json
      return json as TaskItem
    }
  }
})