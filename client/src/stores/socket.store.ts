import { defineStore } from 'pinia'
import { ref } from 'vue'
import { io, Socket } from 'socket.io-client'
import { useTaskStore } from './task.store'
import { useColumnStore } from './column.store'

interface OnlineUser {
  userId: string
  name: string
  email: string
}

export const useSocketStore = defineStore('socket', () => {
  const socket = ref<Socket | null>(null)
  const isConnected = ref(false)
  const onlineUsers = ref<OnlineUser[]>([])

  // Connect to Socket.io server
  // Called when user opens a board
  function connect(token: string) {
    if (socket.value?.connected) return

    socket.value = io((import.meta as any).env.VITE_SOCKET_URL as string, {
      auth: { token }, // JWT sent in handshake for auth middleware
      withCredentials: true,
      transports: ['websocket', 'polling'], // Try WebSocket first, fall back to polling
    })

    socket.value.on('connect', () => {
      isConnected.value = true
      console.log('🔌 Socket connected:', socket.value?.id)
    })

    socket.value.on('disconnect', () => {
      isConnected.value = false
      console.log('❌ Socket disconnected')
    })

    // Register all server→client event listeners
    registerEventListeners()
  }

  function disconnect() {
    socket.value?.disconnect()
    socket.value = null
    isConnected.value = false
    onlineUsers.value = []
  }

  function joinBoard(boardId: string) {
    socket.value?.emit('board:join', { boardId })
  }

  function leaveBoard(boardId: string) {
    socket.value?.emit('board:leave', { boardId })
  }

  // Emit task:move — server updates DB and broadcasts to others
  function emitTaskMove(data: {
    boardId: string
    taskId: string
    fromColumnId: string
    toColumnId: string
    position: number
  }) {
    socket.value?.emit('task:move', data)
  }

  // ── Event Listeners ──────────────────────────────────────────────────────
  // These handle events coming FROM the server
  function registerEventListeners() {
    if (!socket.value) return

    const taskStore = useTaskStore()
    const columnStore = useColumnStore()

    // ── Presence ────────────────────────────────────────────────────────────
    socket.value.on('board:presence', ({ onlineUsers: users }) => {
      onlineUsers.value = users
    })

    socket.value.on('board:user:joined', ({ user }) => {
      // Add to online list if not already there
      if (!onlineUsers.value.find((u) => u.userId === user.userId)) {
        onlineUsers.value.push(user)
      }
    })

    socket.value.on('board:user:left', ({ userId }) => {
      onlineUsers.value = onlineUsers.value.filter((u) => u.userId !== userId)
    })

    // ── Task Events ──────────────────────────────────────────────────────────
    // Another user moved a task — update our board
    socket.value.on('task:moved', ({ taskId, fromColumnId, toColumnId, position }) => {
      taskStore.moveTaskOptimistic(taskId, fromColumnId, toColumnId, position)
    })

    // Another user created a task — add it to our board
    socket.value.on('task:created', ({ task }) => {
      const colTasks = taskStore.tasks[task.columnId] || []
      if (!colTasks.find((t) => t.id === task.id)) {
        taskStore.tasks[task.columnId] = [...colTasks, task as never]
      }
    })

    // Another user deleted a task — remove from our board
    socket.value.on('task:deleted', ({ taskId, columnId }) => {
      taskStore.tasks[columnId] = (taskStore.tasks[columnId] || []).filter(
        (t) => t.id !== taskId
      )
    })

    // ── Column Events ────────────────────────────────────────────────────────
    socket.value.on('column:created', ({ column }) => {
      if (!columnStore.columns.find((c) => c.id === column.id)) {
        columnStore.columns.push(column as never)
      }
    })

    socket.value.on('column:deleted', ({ columnId }) => {
      columnStore.columns = columnStore.columns.filter((c) => c.id !== columnId)
      delete taskStore.tasks[columnId]
    })

    // ── Error Handling ───────────────────────────────────────────────────────
    socket.value.on('task:move:error', ({ taskId, error }) => {
      console.error('Task move failed:', taskId, error)
      // BoardPage handles the rollback via its own snapshot
    })
  }

  return {
    socket,
    isConnected,
    onlineUsers,
    connect,
    disconnect,
    joinBoard,
    leaveBoard,
    emitTaskMove,
  }
})