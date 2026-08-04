import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'

const md = new MarkdownIt({ html: false, linkify: true, breaks: true })

function parseYamlBlock(block: string): Record<string, any> {
  const result: Record<string, any> = {}
  const lines = block.split(/\r?\n/).filter(s => s.trim().length > 0)
  const stack: Array<{ key: string; level: number; obj: Record<string, any> }> = []
  
  for (const line of lines) {
    const leadingSpaces = line.match(/^\s*/)?.[0]?.length || 0
    const stripped = line.trim()
    const mm = stripped.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/)
    
    if (mm) {
      const key = mm[1]
      const value = mm[2].trim()
      const currentLevel = Math.floor(leadingSpaces / 2)
      
      while (stack.length > 0 && stack[stack.length - 1].level >= currentLevel) {
        stack.pop()
      }
      
      if (value) {
        const entry = stack.length > 0 ? stack[stack.length - 1].obj : result
        entry[key] = value
      } else {
        const newObj: Record<string, any> = {}
        if (stack.length > 0) {
          stack[stack.length - 1].obj[key] = newObj
        } else {
          result[key] = newObj
        }
        stack.push({ key, level: currentLevel, obj: newObj })
      }
    }
  }
  
  return result
}

function flattenObject(obj: Record<string, any>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {}
  for (const key in obj) {
    const value = obj[key]
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, fullKey))
    } else {
      result[fullKey] = String(value).trim()
    }
  }
  return result
}

function extractFrontMatter(src: string): { html: string; body: string } {
  const m = src.match(/^\s*---\s*([\s\S]*?)\s*---\s*/)
  if (!m) return { html: '', body: src }
  const block = m[1] || ''
  const body = src.slice(m[0].length)
  const yamlObj = parseYamlBlock(block)
  const flatKv = flattenObject(yamlObj)
  
  const fieldsHtml = Object.keys(flatKv).map(k => {
    const v = String(flatKv[k] || '').trim()
    if (!v) return ''
    const isDesc = k === 'description'
    const divClass = isDesc ? 'text-sm text-gray-900 leading-relaxed' : 'text-sm text-gray-900'
    return `<div class="${divClass}"><span class="text-gray-700">${escapeHtml(k)}:</span> ${escapeHtml(v)}</div>`
  }).filter(Boolean).join('')
  
  const header = `
    <div class="rounded-lg border border-orange-200 bg-orange-50 p-4 mb-4">
      <div class="space-y-2">
        ${fieldsHtml}
      </div>
    </div>
  `
  return { html: header, body }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function renderMarkdown(input: string): string {
  const src = input || ''
  const { html, body } = extractFrontMatter(src)
  const rendered = md.render(body)
  const combined = `${html}${rendered}`
  return DOMPurify.sanitize(combined)
}
