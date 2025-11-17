import fs from 'fs'
import path from 'path'

function getArg(name: string, def?: string): string {
  const i = process.argv.findIndex(a => a === name)
  return i >= 0 ? String(process.argv[i + 1] || def || '') : (def || '')
}

const OWNER = getArg('--owner', process.env.GH_OWNER || 'K-Dense-AI')
const REPO = getArg('--repo', process.env.GH_REPO || 'claude-scientific-skills')
const ROOT_DIR = getArg('--root', process.env.SKILLS_ROOT || 'scientific-skills')
const INSTALL_CMD = getArg('--install', process.env.INSTALL_CMD || '/plugin marketplace add K-Dense-AI/claude-scientific-skills')
const AUTHOR_NAME = getArg('--author', process.env.AUTHOR_NAME || OWNER)
const API_BASE = process.env.API_BASE || 'http://127.0.0.1:3010'
const GH_TOKEN = process.env.GITHUB_TOKEN || ''
const EXCLUDE = getArg('--exclude', process.env.SKILLS_EXCLUDE || '')
const MD_FILE = getArg('--md', process.env.SKILL_MD || 'SKILL.md')

async function run(): Promise<void> {
  const dry = process.argv.includes('--dry-run')
  const localArgIdx = process.argv.findIndex(a => a === '--local')
  const localPath = localArgIdx >= 0 ? String(process.argv[localArgIdx + 1] || '') : ''
  const localRoot = localPath || process.env.SCIENTIFIC_SKILLS_PATH || ''
  const token = dry ? '' : await loginAdmin()
  const dirs = localRoot ? await listDirsLocal(localRoot) : await listDirs()
  let created = 0
  let updated = 0
  let failed = 0
  const outPath = path.join(process.cwd(), 'api', 'data', 'github-scientific-skills.jsonl')
  if (dry) fs.writeFileSync(outPath, '')
  for (const d of dirs) {
    try {
      const md = localRoot ? await readSkillMdLocal(localRoot, d) : await readSkillMd(d)
      const desc = parseDescription(md)
      const prefix = ROOT_DIR && ROOT_DIR !== '.' ? `${ROOT_DIR}/` : ''
      const gitUrl = `https://github.com/${OWNER}/${REPO}/tree/main/${prefix}${d}`
      const payload = {
        title: d,
        description: desc.description || null,
        content: md,
        author_name: AUTHOR_NAME,
        git_url: isHttpsUrl(gitUrl) ? gitUrl : null,
        install_command: validInstall(INSTALL_CMD) ? INSTALL_CMD : null,
        status: 'draft'
      }
      if (dry) {
        fs.appendFileSync(outPath, JSON.stringify({
          name: d,
          authorName: AUTHOR_NAME,
          rootDir: ROOT_DIR,
          description: payload.description || '',
          content: md,
          status: 'draft',
          gitUrl,
          sourceRepo: `https://github.com/${OWNER}/${REPO}`,
          skillDir: d,
          descriptionSource: desc.source,
          missingSkillMd: false
        }) + '\n')
        created++
        logEntry(d, d, 'created')
        continue
      }
      const existingId = await findExisting(payload, token)
      if (existingId) {
        await updateSkill(existingId, payload, token)
        updated++
        logEntry(d, payload.title, 'updated')
      } else {
        await createSkill(payload, token)
        created++
        logEntry(d, payload.title, 'created')
      }
    } catch (e: any) {
      failed++
      console.warn(`[failed] dir=${String(d)} reason=${String(e?.message || e).slice(0,200)}`)
      continue
    }
  }
  console.log(`total=${dirs.length} created=${created} updated=${updated} failed=${failed} dry=${dry}`)
}

async function loginAdmin(): Promise<string> {
  const username = process.env.ADMIN_USERNAME || 'admin'
  const password = process.env.ADMIN_PASSWORD || 'tonyadmin'
  const res = await fetch(`${API_BASE}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ username, password })
  })
  if (!res.ok) throw new Error(`login failed: ${res.status}`)
  const data = await res.json()
  return String(data?.token || '')
}

async function gh(url: string): Promise<any> {
  const headers: Record<string, string> = { 'Accept': 'application/vnd.github+json' }
  if (GH_TOKEN) headers.Authorization = `Bearer ${GH_TOKEN}`
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`github ${res.status}`)
  return res.json()
}

async function listDirs(): Promise<string[]> {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${ROOT_DIR}`
  const items = await gh(url)
  let names = (Array.isArray(items) ? items : []).filter((i: any) => i.type === 'dir').map((i: any) => String(i.name))
  const excl = EXCLUDE.split(',').map(s => s.trim()).filter(Boolean)
  if (excl.length) names = names.filter(n => !excl.includes(n))
  return names
}

async function listDirsLocal(root: string): Promise<string[]> {
  const base = path.resolve(root)
  const excl = EXCLUDE.split(',').map(s => s.trim()).filter(Boolean)
  const out: string[] = []
  const walk = (dir: string, rel: string) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const e of entries) {
      if (!e.isDirectory()) continue
      if (e.name === '.git') continue
      if (excl.includes(e.name)) continue
      const abs = path.join(dir, e.name)
      const r = rel ? `${rel}/${e.name}` : e.name
      if (hasMd(abs)) out.push(r)
      else walk(abs, r)
    }
  }
  walk(base, '')
  return out
}

async function readSkillMd(dir: string): Promise<string> {
  const prefix = ROOT_DIR && ROOT_DIR !== '.' ? `${ROOT_DIR}/` : ''
  const filenames = [MD_FILE, 'README.md', 'readme.md']
  for (const f of filenames) {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${prefix}${dir}/${f}`
    try {
      const data = await gh(url)
      const content = Buffer.from(String(data?.content || ''), 'base64').toString('utf8')
      if (content) return content
    } catch {}
  }
  throw new Error('missing SKILL.md')
}

async function readSkillMdLocal(root: string, dir: string): Promise<string> {
  const base = path.join(path.resolve(root), dir)
  const filenames = [MD_FILE, 'README.md', 'readme.md']
  for (const f of filenames) {
    const p = path.join(base, f)
    if (fs.existsSync(p)) {
      const buf = fs.readFileSync(p)
      const content = buf.toString('utf8')
      if (content.trim()) return content
    }
  }
  throw new Error('missing SKILL.md')
}

function hasMd(absDir: string): boolean {
  const filenames = [MD_FILE, 'README.md', 'readme.md']
  for (const f of filenames) {
    const p = path.join(absDir, f)
    if (fs.existsSync(p)) {
      try {
        const s = fs.statSync(p)
        if (s.isFile()) return true
      } catch {}
    }
  }
  return false
}

function parseDescription(md: string): { description: string; source: 'metadata' | 'fallback' } {
  const m = md.match(/^---\n([\s\S]*?)\n---\n/)
  if (m) {
    const fm = m[1]
    const dline = fm.split('\n').find(l => /^description\s*:\s*/i.test(l))
    if (dline) {
      const desc = String(dline.replace(/^description\s*:\s*/i, '')).trim()
      if (desc) return { description: desc, source: 'metadata' }
    }
  }
  const body = md.replace(/^---[\s\S]*?---\n/, '')
  const paras = body.split(/\n\n+/)
  const first = paras.find(t => t.trim() && !/^#/.test(t.trim())) || ''
  return { description: first.trim().slice(0, 200), source: 'fallback' }
}

async function findExisting(mapped: any, token: string): Promise<string | null> {
  if (mapped.git_url) {
    const byGit = await searchSkill({ git_url: mapped.git_url }, token)
    if (byGit.length > 0) return String(byGit[0]?.id)
  }
  const byTitleAuthor = await searchSkill({ title: mapped.title, author_name: mapped.author_name || '' }, token)
  if (byTitleAuthor.length > 0) return String(byTitleAuthor[0]?.id)
  return null
}

async function searchSkill(params: { git_url?: string; title?: string; author_name?: string }, token: string): Promise<any[]> {
  const usp = new URLSearchParams()
  if (params.git_url) usp.append('git_url', params.git_url)
  if (params.title) usp.append('title', params.title)
  if (params.author_name) usp.append('author_name', params.author_name)
  const res = await fetch(`${API_BASE}/api/admin/skills/search?${usp.toString()}`, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error(`search failed: ${res.status}`)
  const j = await res.json()
  return Array.isArray(j?.items) ? j.items : []
}

async function createSkill(payload: any, token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/skills`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error(`create failed: ${res.status}`)
}

async function updateSkill(id: string, payload: any, token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/skills/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error(`update failed: ${res.status}`)
}

function isHttpsUrl(url: string | null): boolean {
  if (!url) return false
  try {
    const u = new URL(url)
    return u.protocol === 'https:'
  } catch {
    return false
  }
}

function validInstall(cmd: string | null): boolean {
  if (!cmd) return false
  if (cmd.length > 200) return false
  return /^[\x20-\x7E]+$/.test(cmd)
}

function logEntry(skillId: string, title: string, result: 'created' | 'updated' | 'failed'): void {
  console.log(`[${result}] skillId=${String(skillId || '')} title=${String(title || '')}`)
}

run().catch(err => {
  console.error('collect failed:', err?.message || err)
  process.exit(1)
})