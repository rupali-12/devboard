import api from './axios'
import type { Task } from '@/types'

export interface CreateTaskPayload {
  columnId: string
  title: string
  description?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
}

export interface MoveTaskPayload {
  columnId: string
  position: number
}

export const taskApi = {
  getAll: (boardId: string) =>
    api.get<{ tasks: Record<string, Task[]> }>(`/boards/${boardId}/tasks`),
  
   getArchived: (boardId: string) =>
    api.get<{ tasks: Task[] }>(`/boards/${boardId}/tasks/archived`),

  restore: (boardId: string, taskId: string) =>
    api.patch<{ task: Task }>(`/boards/${boardId}/tasks/${taskId}/restore`),

  create: (boardId: string, data: CreateTaskPayload) =>
    api.post<{ task: Task }>(`/boards/${boardId}/tasks`, data),

  update: (boardId: string, taskId: string, data: Partial<Task>) =>
    api.patch<{ task: Task }>(`/boards/${boardId}/tasks/${taskId}`, data),

  move: (boardId: string, taskId: string, data: MoveTaskPayload) =>
    api.patch<{ task: Task }>(`/boards/${boardId}/tasks/${taskId}/move`, data),

  archive: (boardId: string, taskId: string) =>
    api.delete(`/boards/${boardId}/tasks/${taskId}`),

   permanentDelete: (boardId: string, taskId: string) =>
    api.delete(`/boards/${boardId}/tasks/${taskId}/permanent`),
}

