// client/src/api/board.api.ts
import api from './axios'
import type { Board } from '../types'

export interface CreateBoardPayload {
  name: string
  description?: string
  background?: string
}

export interface UpdateBoardPayload {
  name?: string
  description?: string
  background?: string
}

export const boardApi = {
  // Get all boards for logged-in user
  getAll: () =>
    api.get<{ boards: Board[] }>('/boards'),

  // Get single board with full member details
  getById: (boardId: string) =>
    api.get<{ board: Board }>(`/boards/${boardId}`),

  // Create a new board
  create: (data: CreateBoardPayload) =>
    api.post<{ board: Board }>('/boards', data),

  // Update board settings
  update: (boardId: string, data: UpdateBoardPayload) =>
    api.patch<{ board: Board }>(`/boards/${boardId}`, data),

  // Archive (soft delete) a board
  archive: (boardId: string) =>
    api.delete(`/boards/${boardId}`),

  // Invite a member by email
  inviteMember: (boardId: string, email: string, role: 'member' | 'viewer') =>
    api.post(`/boards/${boardId}/invite`, { email, role }),

  // Remove a member
  removeMember: (boardId: string, userId: string) =>
    api.delete(`/boards/${boardId}/members/${userId}`),
}