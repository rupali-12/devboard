import express, { Request, Response } from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import { connectDB } from '../src/config/database'
import authRoutes from '../src/routes/auth.routes'
import boardRoutes from '../src/routes/board.routes'
import columnRoutes from '../src/routes/column.routes'
import taskRoutes from '../src/routes/task.routes'

dotenv.config()

const app = express()

// Manual CORS — handle it ourselves, no library
app.use((req, res, next) => {
  const origin = req.headers.origin
  const allowedOrigins = [
    'http://localhost:5173',
    'https://devboard-eosin-alpha.vercel.app',
    process.env.FRONTEND_URL,
  ].filter(Boolean) as string[]

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  } else if (!origin) {
    // Postman, server-to-server — allow
    res.setHeader('Access-Control-Allow-Origin', '*')
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Cookie,X-Requested-With')

  // Handle preflight immediately
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  next()
})

app.use(express.json())
app.use(cookieParser())

// Connect DB before every request
app.use(async (_req, res, next) => {
  try {
    await connectDB()
    next()
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed' })
  }
})

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'DevBoard API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
})

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/boards', boardRoutes)
app.use('/api/v1/boards/:boardId/columns', columnRoutes)
app.use('/api/v1/boards/:boardId/tasks', taskRoutes)

export default app