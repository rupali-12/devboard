// server/src/socket/index.ts
import { Server, Socket } from 'socket.io'
import {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
  OnlineUser,
} from '../types/socket.types'
import { verifyToken } from '../utils/jwt'
import { moveTask } from '../services/task.service'

// Map of boardId -> Set of online users
// This tracks who is currently viewing each board
const boardPresence = new Map<string, Map<string, OnlineUser>>()

type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>
type AppServer = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>

export function setupSocketIO(io: AppServer) {

  // ── Auth Middleware ────────────────────────────────────────────────────────
  // Runs before every socket connection is established
  io.use((socket, next) => {
    const token = socket.handshake.auth.token

    if (!token) {
      return next(new Error('Authentication required'))
    }

    try {
      const decoded = verifyToken(token)
      // Attach user data to socket — available in all event handlers
      socket.data.userId = decoded.userId
      socket.data.userEmail = decoded.email
      next()
    } catch {
      next(new Error('Invalid or expired token'))
    }
  })

  io.on('connection', (socket: AppSocket) => {
    console.log(`🔌 Socket connected: ${socket.id} (user: ${socket.data.userEmail})`)

    // ── Board: Join ────────────────────────────────────────────────────────
    socket.on('board:join', ({ boardId }) => {
      socket.join(boardId)

      const user: OnlineUser = {
        userId: socket.data.userId,
        name: socket.data.userEmail.split('@')[0], // Use email prefix as name fallback
        email: socket.data.userEmail,
      }

      // Add to presence map
      if (!boardPresence.has(boardId)) {
        boardPresence.set(boardId, new Map())
      }
      boardPresence.get(boardId)!.set(socket.data.userId, user)

      // Tell the joining user who is already online
      const onlineUsers = Array.from(boardPresence.get(boardId)!.values())
      socket.emit('board:presence', { onlineUsers })

      // Tell everyone else in the room that this user joined
      socket.to(boardId).emit('board:user:joined', { user })

      console.log(`📋 User ${socket.data.userEmail} joined board ${boardId}`)
    })

    // ── Board: Leave ───────────────────────────────────────────────────────
    socket.on('board:leave', ({ boardId }) => {
      handleUserLeavingBoard(io, socket, boardId)
    })

    // ── Task: Move ─────────────────────────────────────────────────────────
    // This is the most important real-time event
    socket.on('task:move', async ({ boardId, taskId, fromColumnId, toColumnId, position }) => {
      try {
        // Update database
        await moveTask(taskId, boardId, { columnId: toColumnId, position })

        // Broadcast to all OTHER users in this board room
        // The moving user already updated their UI optimistically
        socket.to(boardId).emit('task:moved', {
          taskId,
          fromColumnId,
          toColumnId,
          position,
          movedBy: socket.data.userId,
        })
      } catch (error) {
        // Tell the sender their move failed — they need to rollback
        socket.emit('task:move:error', {
          taskId,
          error: 'Failed to move task. Please try again.',
        })
        console.error('task:move error:', error)
      }
    })

    // ── Disconnect ─────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      // Remove from ALL boards this user was in
      boardPresence.forEach((users, boardId) => {
        if (users.has(socket.data.userId)) {
          handleUserLeavingBoard(io, socket, boardId)
        }
      })
      console.log(`❌ Socket disconnected: ${socket.id}`)
    })
  })
}

function handleUserLeavingBoard(io: AppServer, socket: AppSocket, boardId: string) {
  socket.leave(boardId)

  const boardUsers = boardPresence.get(boardId)
  if (boardUsers) {
    boardUsers.delete(socket.data.userId)
    if (boardUsers.size === 0) {
      boardPresence.delete(boardId) // Clean up empty rooms
    }
  }

  // Tell others this user left
  io.to(boardId).emit('board:user:left', { userId: socket.data.userId })
}