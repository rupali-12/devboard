import express, { Request, Response } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import mongoose from 'mongoose'
import authRoutes from '../src/routes/auth.routes'
import boardRoutes from '../src/routes/board.routes'
import columnRoutes from '../src/routes/column.routes'
import taskRoutes from '../src/routes/task.routes'

dotenv.config()

const app = express()

// ── DB Connection ─────────────────────────────────────────────────────────
let isConnected = false

async function connectDB() {
  if (isConnected) return
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI not defined')
  await mongoose.connect(uri, { maxPoolSize: 10 })
  isConnected = true
  console.log('✅ MongoDB connected')
}

// ── CORS — explicitly list all allowed origins ────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://devboard-eosin-alpha.vercel.app',  // ← your actual frontend URL
  process.env.FRONTEND_URL,
].filter(Boolean) as string[]

app.use(helmet({
  crossOriginResourcePolicy: false, // Allow cross-origin requests
}))

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, mobile)
      if (!origin) return callback(null, true)

      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      console.log('CORS blocked origin:', origin)
      console.log('Allowed origins:', allowedOrigins)
      return callback(null, true) // ← temporarily allow ALL origins to debug
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  })
)

// Handle OPTIONS preflight requests explicitly
app.options('*', cors())

app.use(express.json())
app.use(cookieParser())

// ── Connect DB before handling requests ───────────────────────────────────
app.use(async (req, res, next) => {
  try {
    await connectDB()
    next()
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed' })
  }
})

// ── Routes ────────────────────────────────────────────────────────────────
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'DevBoard API is running',
    environment: process.env.NODE_ENV,
    allowedOrigins,
    timestamp: new Date().toISOString(),
  })
})

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/boards', boardRoutes)
app.use('/api/v1/boards/:boardId/columns', columnRoutes)
app.use('/api/v1/boards/:boardId/tasks', taskRoutes)

export default app