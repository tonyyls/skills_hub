import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'

const md = new MarkdownIt({ html: false, linkify: true, breaks: true })

function extractFrontMatter(src: string): { html: string; body: string } {
  const m = src.match(/^\s*---\s*([\s\S]*?)\s*---\s*/)
  if (!m) return { html: '', body: src }
  const block = m[1] || ''
  const body = src.slice(m[0].length)
  const lines = block.split(/\r?\n/).map(s => s.trim()).filter(Boolean)
  const kv: Record<string, string> = {}
  for (const line of lines) {
    const mm = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.+)$/)
    if (mm) kv[mm[1]] = mm[2]
  }
  const name = (kv['name'] || '').trim()
  const desc = (kv['description'] || '').trim()
  const others = Object.keys(kv).filter(k => k !== 'name' && k !== 'description')
  const chips = others.map(k => {
    const v = String(kv[k] || '').trim()
    if (!v) return ''
    return `<span class="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">${escapeHtml(k)}: ${escapeHtml(v)}</span>`
  }).filter(Boolean).join('')
  const header = `
    <div class="rounded-lg border border-orange-200 bg-orange-50 p-4 mb-4">
      <div class="space-y-2">
        ${name ? `<div class="text-sm text-gray-900"><span class="text-gray-700">name:</span> ${escapeHtml(name)}</div>` : ''}
        ${desc ? `<div class="text-sm text-gray-900 leading-relaxed"><span class="text-gray-700">description:</span> ${escapeHtml(desc)}</div>` : ''}
        ${chips ? `<div class="mt-1 flex flex-wrap gap-2">${chips}</div>` : ''}
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
