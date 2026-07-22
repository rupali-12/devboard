import express, { Request, Response } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'

import { connectDB } from '../src/config/database'

import authRoutes from '../src/routes/auth.routes'
import boardRoutes from '../src/routes/board.routes'
import columnRoutes from '../src/routes/column.routes'
import taskRoutes from '../src/routes/task.routes'

dotenv.config()

const app = express()

const allowedOrigins = [
  'http://localhost:5173',
    'http://localhost:3000',
  'https://devboard-eosin-alpha.vercel.app', 
  process.env.FRONTEND_URL,
].filter(Boolean) as string[]

app.use(helmet())

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)

      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      callback(new Error(`CORS blocked: ${origin}`))
    },
    credentials: true,
  })
)

app.use(express.json())
app.use(cookieParser())

// Connect DB before every request
app.use(async (_req, res, next) => {
  try {
    await connectDB()
    next()
  } catch (err) {
    console.error(err)
    res.status(500).json({
      error: 'Database connection failed',
    })
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