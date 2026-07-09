// client/src/api/auth.api.ts
import api from './axios'
import type { User } from '../types'

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export const authApi = {
  register: (data: RegisterPayload) =>
    api.post<{ user: User }>('/auth/register', data),

  login: (data: LoginPayload) =>
    api.post<{ user: User }>('/auth/login', data),

  logout: () =>
    api.post('/auth/logout'),

  me: () =>
    api.get<{ user: User }>('/auth/me'),
}