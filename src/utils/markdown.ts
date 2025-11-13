import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'

const md = new MarkdownIt({ html: false, linkify: true, breaks: true })

export function renderMarkdown(input: string): string {
  const raw = md.render(input || '')
  return DOMPurify.sanitize(raw)
}

