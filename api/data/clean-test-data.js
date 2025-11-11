import readline from 'readline'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 加载根目录 .env（确保服务密钥仅用于后端脚本）
dotenv.config({ path: path.join(__dirname, '../../.env') })

// 读取 Supabase 服务端凭据（优先 VITE_ 前缀，其次非 VITE_ 前缀）
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ 缺少 Supabase 配置：VITE_SUPABASE_URL / SUPABASE_URL 与 VITE_SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

/**
 * 探测指定表是否存在某列（通过最小化查询判定）。
 * 若 PostgREST 返回列不存在错误，则判定为不存在。
 *
 * @param {string} table 表名
 * @param {string} column 列名
 * @returns {Promise<boolean>} 是否存在该列
 */
async function detectColumnExists (table, column) {
  try {
    const { error } = await supabase.from(table).select(`${column}`).limit(1)
    if (error && /does not exist/i.test(error.message)) return false
    return true
  } catch (_) {
    return false
  }
}

/**
 * 解析命令行参数
 * 支持：
 * - --dry-run           预览模式，不执行删除
 * - --yes               跳过交互确认，直接执行（谨慎使用）
 * - --status <list>     指定删除的状态，逗号分隔（默认：draft,inactive）
 * - --include-null      同时删除 status=NULL 的记录
 * - --id-prefix <str>   按 id 前缀匹配（注意：若 id 为 UUID，前缀匹配无效）
 * - --title-prefix <str>按标题前缀匹配
 * - --created-before <YYYY-MM-DD> 仅删除该日期之前创建的数据
 *
 * 官方文档参考：
 * - Filters `.or` / `.in` / `.is` / `.like`：https://supabase.com/docs/reference/javascript/select#filters
 */
/**
 * 解析命令行参数。
 * @returns {{ dryRun: boolean, yes: boolean, includeNull: boolean, statuses: string[], idPrefix?: string, titlePrefix?: string, namePrefix?: string, createdBefore?: string }}
 */
function parseArgs () {
  const args = process.argv.slice(2)
  const getArg = (flag) => {
    const idx = args.indexOf(flag)
    return idx !== -1 ? args[idx + 1] : undefined
  }
  const dryRun = args.includes('--dry-run')
  const yes = args.includes('--yes')
  const includeNull = args.includes('--include-null')
  const statusArg = getArg('--status')
  const idPrefix = getArg('--id-prefix')
  const titlePrefix = getArg('--title-prefix')
  const namePrefix = getArg('--name-prefix')
  const createdBefore = getArg('--created-before')

  const statuses = (statusArg ? statusArg.split(',') : ['draft', 'inactive'])
    .map(s => s.trim()).filter(Boolean)

  return { dryRun, yes, includeNull, statuses, idPrefix, titlePrefix, namePrefix, createdBefore }
}

/**
 * 构造查询过滤器（select/delete 通用）
 * 为避免误删，若用户未指定任何过滤项，默认仅按状态（draft/inactive/null）过滤。
 * @param {import('@supabase/supabase-js').PostgrestQueryBuilder} qb 表查询构造器
 * @param {{ includeNull: boolean, statuses: string[], idPrefix?: string, titlePrefix?: string, namePrefix?: string, createdBefore?: string }} f 过滤条件
 * @param {{ hasTitleColumn?: boolean, hasNameColumn?: boolean }} meta 元信息：是否存在 title/name 列
 * @returns {import('@supabase/supabase-js').PostgrestQueryBuilder} 叠加过滤后的构造器
 */
function applyFilters (qb, f, meta = {}) {
  const ors = []
  if (f.includeNull) ors.push('status.is.null')
  if (f.statuses?.length) ors.push(`status.in.(${f.statuses.join(',')})`)
  // 若未指定任何过滤条件，强制按状态过滤，避免全表删除
  if (ors.length === 0) {
    ors.push('status.is.null', 'status.in.(draft,inactive)')
  }
  qb = qb.or(ors.join(','))

  if (f.idPrefix) {
    // 警告：id 为 UUID 时，like 前缀匹配可能无效
    qb = qb.like('id', `${f.idPrefix}%`)
  }
  if (f.titlePrefix && meta.hasTitleColumn) {
    // 仅当存在 title 列时才使用服务端 like 过滤
    qb = qb.like('title', `${f.titlePrefix}%`)
  }
  if (f.namePrefix && meta.hasNameColumn) {
    qb = qb.like('name', `${f.namePrefix}%`)
  }
  if (f.createdBefore) {
    const iso = new Date(f.createdBefore).toISOString()
    qb = qb.lt('created_at', iso)
  }
  return qb
}

/**
 * 交互确认：要求输入 YES 才继续执行
 * @returns {Promise<boolean>} 是否确认继续
 */
function confirmInteractive () {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question('⚠️ 确认删除匹配的测试数据？输入 YES 继续，其他任何键取消：', (answer) => {
      rl.close()
      resolve(answer.trim() === 'YES')
    })
  })
}

/**
 * 主执行函数：预览 → 确认 → 删除 → 统计
 */
/**
 * 主执行函数：预览 → 确认 → 删除 → 统计。
 * @returns {Promise<void>}
 */
async function main () {
  const args = parseArgs()
  console.log('🔧 清理参数:', args)

  // 探测列存在性，避免选择/过滤不存在列导致报错
  const hasTitleColumn = await detectColumnExists('skills', 'title')
  const hasNameColumn = await detectColumnExists('skills', 'name')
  if (!hasTitleColumn) {
    console.warn('⚠️ 检测到 skills.title 列不存在：将使用通配选择并在客户端进行前缀匹配回退。')
  }
  if (!hasNameColumn) {
    console.warn('⚠️ 检测到 skills.name 列不存在：如需按名称前缀过滤，请确保该列存在。')
  }

  // 预览匹配数据
  const selectCols = ['id', 'status', 'created_at']
  if (hasTitleColumn) selectCols.push('title')
  if (hasNameColumn) selectCols.push('name')

  let preview = applyFilters(
    supabase.from('skills').select(selectCols.join(', '), { count: 'exact' }),
    args,
    { hasTitleColumn, hasNameColumn }
  )

  const { data: rows, count, error: previewError } = await preview
  if (previewError) {
    console.error('❌ 预览失败:', previewError.message)
    process.exit(1)
  }

  // 若请求了标题前缀且不存在 title 列，则在客户端进行前缀过滤（尝试常见备选列）
  let previewRows = rows || []
  const needClientTitle = args.titlePrefix && !hasTitleColumn
  const needClientName = args.namePrefix && !hasNameColumn
  if (needClientTitle || needClientName) {
    const tPrefix = args.titlePrefix
    const nPrefix = args.namePrefix
    previewRows = previewRows.filter(r => {
      const tCandidates = [r.title, r.title_zh, r.title_en]
      const nCandidates = [r.name]
      const tOk = !needClientTitle || tCandidates.some(v => typeof v === 'string' && v.startsWith(tPrefix))
      const nOk = !needClientName || nCandidates.some(v => typeof v === 'string' && v.startsWith(nPrefix))
      return tOk && nOk
    })
  }

  console.log(`📊 预览匹配到 ${count ?? (rows?.length || 0)} 条记录，示例：`)
  previewRows.slice(0, 10).forEach((r, i) => {
    const title = hasTitleColumn ? r.title : (r.title ?? r.title_zh ?? r.title_en ?? '(无)')
    const name = hasNameColumn ? r.name : (r.name ?? '(无)')
    console.log(`  ${i + 1}. id=${r.id} title=${title} name=${name} status=${r.status ?? 'NULL'} created_at=${r.created_at}`)
  })

  if (args.dryRun) {
    console.log('🧪 干跑模式：不执行删除。')
    process.exit(0)
  }

  // 交互/非交互确认
  let confirmed = args.yes
  if (!confirmed) {
    confirmed = await confirmInteractive()
  }
  if (!confirmed) {
    console.log('🚫 已取消删除。')
    process.exit(0)
  }

  // 执行删除
  let deletion
  if ((args.titlePrefix && !hasTitleColumn) || (args.namePrefix && !hasNameColumn)) {
    // 前缀在无对应列时，改为：先选出候选 id（客户端前缀匹配），再按 id 集合删除
    const { data: selectForDelete, error: selectErr } = await applyFilters(
      supabase.from('skills').select(selectCols.join(', ')),
      args,
      { hasTitleColumn, hasNameColumn }
    )
    if (selectErr) {
      console.error('❌ 删除前选择失败:', selectErr.message)
      process.exit(1)
    }
    const ids = (selectForDelete || []).filter(r => {
      const tCandidates = [r.title, r.title_zh, r.title_en]
      const nCandidates = [r.name]
      const tOk = !(args.titlePrefix && !hasTitleColumn) || tCandidates.some(v => typeof v === 'string' && v.startsWith(args.titlePrefix))
      const nOk = !(args.namePrefix && !hasNameColumn) || nCandidates.some(v => typeof v === 'string' && v.startsWith(args.namePrefix))
      return tOk && nOk
    }).map(r => r.id)
    if (!ids.length) {
      console.log('ℹ️ 未找到匹配标题/名称前缀的记录，跳过删除。')
      return
    }
    deletion = supabase.from('skills').delete().in('id', ids)
  } else {
    deletion = applyFilters(
      supabase.from('skills').delete(),
      args,
      { hasTitleColumn, hasNameColumn }
    )
  }

  const { error: deleteError } = await deletion
  if (deleteError) {
    console.error('❌ 删除失败:', deleteError.message)
    process.exit(1)
  }
  console.log('✅ 删除操作完成。')

  // 删除后统计
  const { count: afterCount, error: afterError } = await applyFilters(
    supabase.from('skills').select('id', { count: 'exact', head: true }),
    args
  )
  if (afterError) {
    console.error('⚠️ 删除后统计失败:', afterError.message)
  } else {
    console.log(`📉 删除后剩余匹配记录数：${afterCount}`)
  }
}

main().catch((e) => {
  console.error('❌ 清理脚本异常:', e?.message || e)
  process.exit(1)
})