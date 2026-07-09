import api from './axios'
import type { Column } from '@/types'

export const columnApi = {
  getAll: (boardId: string) =>
    api.get<{ columns: Column[] }>(`/boards/${boardId}/columns`),

  create: (boardId: string, data: { name: string; color?: string }) =>
    api.post<{ column: Column }>(`/boards/${boardId}/columns`, data),

  update: (boardId: string, columnId: string, data: { name?: string; color?: string }) =>
    api.patch<{ column: Column }>(`/boards/${boardId}/columns/${columnId}`, data),

  delete: (boardId: string, columnId: string) =>
    api.delete(`/boards/${boardId}/columns/${columnId}`),

  reorder: (boardId: string, orderedIds: string[]) =>
    api.patch(`/boards/${boardId}/columns/reorder`, { orderedIds }),
}