import fs from 'fs'
import path from 'path'

const BASE_URL = 'https://skills.pub/api/skills'
const PAGE_SIZE = 16
const API_BASE = process.env.API_BASE || 'http://127.0.0.1:3010'

async function run(): Promise<void> {
  const token = await loginAdmin()
  const { total } = await fetchPage(1)
  const totalPages = Math.ceil((total || 0) / PAGE_SIZE)
  const statePath = path.join(process.cwd(), 'api', 'data', 'import-state.json')
  let lastPage = 1
  try {
    const raw = fs.readFileSync(statePath, 'utf-8')
    const j = JSON.parse(raw)
    lastPage = Number(j.lastPage || 1)
  } catch {}

  for (let page = lastPage; page <= totalPages; page++) {
    const { skills } = await fetchPage(page)
    let created = 0
    let updated = 0
    let failed = 0
    for (const s of skills) {
      const mapped = mapFields(s)
      try {
        const existingId = await findExisting(mapped, s, token)
        if (existingId) {
          await updateSkill(existingId, mapped, token)
          updated++
          logEntry(s.skillId, mapped.title, 'updated')
        } else {
          await createSkill(mapped, token)
          created++
          logEntry(s.skillId, mapped.title, 'created')
        }
      } catch (e: any) {
        failed++
        console.warn(`[failed] skillId=${String(s?.skillId || '')} title=${String(mapped.title || '')} reason=${String(e?.message || e).slice(0,200)}`)
        continue
      }
    }
    fs.writeFileSync(statePath, JSON.stringify({ lastPage: page }, null, 2))
    console.log(`page=${page}/${totalPages} created=${created} updated=${updated} failed=${failed}`)
    await sleep(300)
  }
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

async function fetchPage(page: number): Promise<{ skills: any[]; total: number }> {
  const url = `${BASE_URL}?page=${page}&pageSize=${PAGE_SIZE}`
  let res = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'skills-hub-importer/1.0'
    }
  })
  if (!res.ok && res.status === 405) {
    res = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'skills-hub-importer/1.0'
      },
      body: JSON.stringify({ page, pageSize: PAGE_SIZE })
    })
  }
  if (!res.ok) throw new Error(`fetch ${url} failed: ${res.status}`)
  const j = await res.json()
  const skills = Array.isArray(j?.data?.skills) ? j.data.skills : []
  const total = Number(j?.data?.total || 0)
  return { skills, total }
}

function mapFields(s: any): any {
  const title = String(s?.skillName || `${s?.pluginName || ''} ${s?.repoName || ''}`.trim()).trim()
  const description = String(s?.pluginDescription || '').trim() || null
  const gitUrl = stripTicks(String(s?.repositoryUrl || ''))
  const install = String(s?.pluginBin || '').trim() || null
  return {
    title,
    description,
    author_name: (String(s?.author?.name || '').trim() || null)?.slice(0, 50) || null,
    git_url: isHttpsUrl(gitUrl) ? gitUrl : null,
    install_command: validInstall(install) ? install : null,
    status: 'published'
  }
}

async function findExisting(mapped: any, source: any, token: string): Promise<string | null> {
  if (mapped.git_url) {
    const byGit = await searchSkill({ git_url: mapped.git_url }, token)
    if (byGit.length > 0) return String(byGit[0]?.id)
  }
  const sid = String(source?.skillId || '')
  if (sid) {
    const byTitleAuthor = await searchSkill({ title: mapped.title, author_name: mapped.author_name || '' }, token)
    const hit = byTitleAuthor.find(x => String(x?.external_id || '').trim() === sid)
    if (hit) return String(hit?.id)
  }
  const byTitleAuthor2 = await searchSkill({ title: mapped.title, author_name: mapped.author_name || '' }, token)
  if (byTitleAuthor2.length > 0) return String(byTitleAuthor2[0]?.id)
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

function stripTicks(url: string): string {
  return String(url || '').replace(/[`\s]/g, '').trim()
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

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}

function logEntry(skillId: string, title: string, result: 'created' | 'updated' | 'failed'): void {
  console.log(`[${result}] skillId=${String(skillId || '')} title=${String(title || '')}`)
}

run().catch(err => {
  console.error('import failed:', err?.message || err)
  process.exit(1)
})
