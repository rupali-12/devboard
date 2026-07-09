// server/src/utils/validators/board.validator.ts
import { z } from 'zod'

export const createBoardSchema = z.object({
  name: z.string().trim().min(1, 'Board name is required').max(100),
  description: z.string().trim().max(500).optional().default(''),
  background: z.string().optional().default('from-blue-500 to-cyan-400'),
})

export const updateBoardSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(500).optional(),
  background: z.string().optional(),
})

export const inviteMemberSchema = z.object({
  email: z.string().email('Please provide a valid email'),
  role: z.enum(['member', 'viewer']).default('member'),
})

export const updateMemberRoleSchema = z.object({
  role: z.enum(['member', 'viewer']),
})

export type CreateBoardInput = z.infer<typeof createBoardSchema>
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>