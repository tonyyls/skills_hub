import express from 'express'
import type { Request, Response } from 'express'
import publicRouter from './routes/public'
import adminRouter from './routes/admin'

const app = express()
app.use(express.json())

// Mount routers under /api to match client routes
app.use('/api', publicRouter)
app.use('/api', adminRouter)

export default (req: Request, res: Response) => {
  return (app as any)(req, res)
}