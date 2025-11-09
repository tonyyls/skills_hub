/**
 * 密码加密工具（开发/降级模式使用）
 *
 * 使用 Node.js 内置 `crypto` 的 PBKDF2 实现安全的密码哈希与校验。
 * 注意：生产环境的管理员密码由数据库使用 `bcrypt`（pgcrypto: crypt/gen_salt('bf')）处理，
 * 此工具仅用于本地开发存储（devStore）或服务降级场景。
 */
import crypto from 'crypto'

/**
 * 生成密码哈希（PBKDF2）
 *
 * @param password 明文密码
 * @param options 可选配置：迭代次数、盐长度、摘要算法、派生长度
 * @returns 格式化哈希字符串：`pbkdf2$<iterations>$<salt>$<digest>$<derivedHex>`
 */
export function hashPassword (
  password: string,
  options?: {
    iterations?: number
    saltLength?: number
    digest?: string
    keyLength?: number
  }
): string {
  const iterations = options?.iterations ?? 100_000
  const saltLength = options?.saltLength ?? 16
  const digest = options?.digest ?? 'sha256'
  const keyLength = options?.keyLength ?? 32

  const salt = crypto.randomBytes(saltLength).toString('hex')
  const derived = crypto.pbkdf2Sync(password, salt, iterations, keyLength, digest)
  return `pbkdf2$${iterations}$${salt}$${digest}$${derived.toString('hex')}`
}

/**
 * 校验密码（PBKDF2）
 *
 * @param password 明文密码
 * @param hash 已存储的哈希字符串（`hashPassword` 生成的格式）
 * @returns 是否匹配
 */
export function verifyPassword (password: string, hash: string): boolean {
  try {
    const parts = hash.split('$')
    if (parts.length !== 5 || parts[0] !== 'pbkdf2') return false
    const iterations = parseInt(parts[1], 10)
    const salt = parts[2]
    const digest = parts[3]
    const derivedHex = parts[4]

    const derived = crypto.pbkdf2Sync(password, salt, iterations, Buffer.from(derivedHex, 'hex').length, digest)
    const derivedCheckHex = derived.toString('hex')

    // 使用时间常数比较，避免时序攻击
    const a = Buffer.from(derivedHex, 'hex')
    const b = Buffer.from(derivedCheckHex, 'hex')
    return a.length === b.length && crypto.timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export default { hashPassword, verifyPassword }