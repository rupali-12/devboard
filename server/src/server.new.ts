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
const isVercel = Boolean(process.env.VERCEL)
const PORT = process.env.PORT || 5000
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'https://devboard-eosin-alpha.vercel.app',
  'https://devboard.vercel.app',
].filter(Boolean) as string[]

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.endsWith('.vercel.app/')) {
      callback(null, true)
      return
    }

    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}

const httpServer = !isVercel ? http.createServer(app) : null
const io = !isVercel
  ? new Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>(
      httpServer!,
      {
        cors: {
          origin: allowedOrigins,
          credentials: true,
        },
      }
    )
  : null

app.use(helmet())
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

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

if (!isVercel) {
  setupSocketIO(io!)
}

async function startServer() {
  await connectDB()

  if (isVercel) {
    console.log('Vercel deployment detected; skipping long-lived server startup')
    return
  }

  httpServer!.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
    console.log(`🩺 Health: http://localhost:${PORT}/health`)
    console.log(`🔌 Socket.io ready`)
  })
}

if (require.main === module) {
  startServer()
}

export default app
export { app, startServer }
