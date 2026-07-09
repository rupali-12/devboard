// server/src/types/socket.types.ts

// Events the CLIENT sends TO the server
export interface ClientToServerEvents {
  'board:join': (data: { boardId: string }) => void
  'board:leave': (data: { boardId: string }) => void
  'task:move': (data: {
    boardId: string
    taskId: string
    fromColumnId: string
    toColumnId: string
    position: number
  }) => void
}

// Events the SERVER sends TO clients
export interface ServerToClientEvents {
  // Board presence
  'board:presence': (data: { onlineUsers: OnlineUser[] }) => void
  'board:user:joined': (data: { user: OnlineUser }) => void
  'board:user:left': (data: { userId: string }) => void

  // Task events
  'task:moved': (data: {
    taskId: string
    fromColumnId: string
    toColumnId: string
    position: number
    movedBy: string
  }) => void
  'task:created': (data: { task: TaskPayload; columnId: string }) => void
  'task:deleted': (data: { taskId: string; columnId: string }) => void
  'task:updated': (data: { taskId: string; changes: Record<string, unknown> }) => void

  // Column events
  'column:created': (data: { column: ColumnPayload }) => void
  'column:deleted': (data: { columnId: string }) => void
  'column:updated': (data: { columnId: string; changes: Record<string, unknown> }) => void

  // Error
  'task:move:error': (data: { taskId: string; error: string }) => void
}

// Data on socket object itself
export interface SocketData {
  userId: string
  userName: string
  userEmail: string
}

export interface OnlineUser {
  userId: string
  name: string
  email: string
}

export interface TaskPayload {
  id: string
  boardId: string
  columnId: string
  title: string
  description: string
  position: number
  priority: string
  labels: unknown[]
  assignees: string[]
  dueDate: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface ColumnPayload {
  id: string
  boardId: string
  name: string
  position: number
  color: string
  taskLimit: number | null
}