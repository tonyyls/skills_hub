import { createServer } from 'vite'

async function start() {
  ;(globalThis as any).crypto = (await import('node:crypto')).webcrypto
  const server = await createServer()
  await server.listen()
  server.printUrls()
}

start().catch((e) => {
  console.error(e)
  process.exit(1)
})