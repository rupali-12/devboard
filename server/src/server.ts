import express, { Request, Response } from 'express'
import http from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { connectDB } from './config/database'
import authRoutes from './routes/auth.routes'
import boardRoutes from './routes/board.routes'
import columnRoutes from './routes/column.routes'
import taskRoutes from './routes/task.routes'
import { setupSocketIO } from './socket/index'
import {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
} from './types/socket.types'

dotenv.config()

const app = express()

// Create HTTP server manually so Socket.io can share it with Express
const httpServer = http.createServer(app)

const io = new Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>(
  httpServer,
  {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    },
  }
)

const PORT = process.env.PORT || 5000

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

// ── REST Routes ────────────────────────────────────────────────────────────
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'DevBoard API is running',
    timestamp: new Date().toISOString(),
  })
})

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/boards', boardRoutes)
app.use('/api/v1/boards/:boardId/columns', columnRoutes)
app.use('/api/v1/boards/:boardId/tasks', taskRoutes)

// ── Socket.io ──────────────────────────────────────────────────────────────
setupSocketIO(io)

// ── Start ──────────────────────────────────────────────────────────────────
async function startServer() {
  await connectDB()

  // Use httpServer.listen not app.listen
  // because Socket.io needs to share the HTTP server
  httpServer.listen(PORT, () => {
    console.log(`🚀  Server running on http://localhost:${PORT}`)
    console.log(`🩺  Health: http://localhost:${PORT}/health`)
    console.log(`🔌  Socket.io ready`)
  })
}

startServer()