export interface AiProvider {
  classifyCategory(input: { description: string; categories: Array<{ id: string; name: string }> }): Promise<{ categoryId: string; confidence: number; tags?: string[] }>
}

export class GlmProvider implements AiProvider {
  private apiKey: string
  private model: string
  private baseUrl: string
  constructor(cfg: { apiKey: string; model?: string; baseUrl?: string }) {
    this.apiKey = cfg.apiKey
    this.model = cfg.model ?? 'glm-4-plus'
    this.baseUrl = cfg.baseUrl ?? 'https://open.bigmodel.cn/api/paas/v4/'
  }
  async classifyCategory(input: { description: string; categories: Array<{ id: string; name: string }> }): Promise<{ categoryId: string; confidence: number; tags?: string[] }> {
    const body = {
      model: this.model,
      messages: [
        { role: 'system', content: '仅返回合法JSON：{categoryId:string, confidence:number, tags:string[]}。从给定categories中选择categoryId；根据标题与描述抽取不超过3个中文标签，彼此尽量差异化、短语化、去重。标签只输出简短中文词语。' },
        { role: 'user', content: JSON.stringify(input) }
      ],
      response_format: { type: 'json_object' },
      stream: false
    }
    const res = await fetch(this.baseUrl + 'chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify(body)
    })
    const data: any = await res.json()
    const text: string = data?.choices?.[0]?.message?.content || '{}'
    const obj = JSON.parse(text)
    const tagsAll = Array.isArray(obj.tags) ? Array.from(new Set(obj.tags.map((t: any) => String(t).trim()).filter(Boolean))) : []
    const tags = tagsAll.slice(0, 3)
    return { categoryId: String(obj.categoryId), confidence: Number(obj.confidence), tags }
  }
}

export class AiService {
  private provider: AiProvider
  constructor(provider: AiProvider) {
    this.provider = provider
  }
  async classifyCategory(description: string, categories: Array<{ id: string; name: string }>) {
    return this.provider.classifyCategory({ description, categories })
  }
}