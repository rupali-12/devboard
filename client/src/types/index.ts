// client/src/types/index.ts

export interface User {
  id: string
  name: string
  email: string
  avatar: string | null
  isVerified: boolean
}

export interface Board {
  id: string
  name: string
  description: string
  background: string
  ownerId: string
  members: BoardMember[]
  memberCount?: number        
  createdAt: string
  updatedAt: string
}

export interface BoardMember {
  userId: User
  role: 'owner' | 'member' | 'viewer'
  joinedAt: string
}

export interface Column {
  id: string
  boardId: string
  name: string
  position: number
  color: string
  taskLimit: number | null
}

export interface Task {
  id: string
  boardId: string
  columnId: string
  title: string
  description: string
  position: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
  labels: Label[]
  assignees: User[]
  dueDate: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface Label {
  name: string
  color: string
}

export interface Comment {
  id: string
  taskId: string
  authorId: User
  content: string
  createdAt: string
  editedAt: string | null
}

export interface Activity {
  id: string
  boardId: string
  userId: User
  type: string
  meta: Record<string, unknown>
  createdAt: string
}

// API response wrapper — all our API responses follow this shape
export interface ApiResponse<T> {
  data?: T
  error?: string
  details?: Record<string, string[]>
}